import "server-only";

import { createHash } from "node:crypto";
import {
  and,
  desc,
  eq,
  isNotNull,
  isNull,
  lt,
  notInArray,
  or,
} from "drizzle-orm";
import sharp from "sharp";
import { z } from "zod";

import { env } from "@/config/env";
import { db } from "@/db/client";
import { postalDispatches, salesActivities, salesLeads } from "@/db/schema";
import { createId } from "@/lib/ids";
import { findPlatformLegalProfile } from "@/modules/legal/repository";
import {
  findPlatformLogoId,
  findPublicMedia,
} from "@/modules/media/repository";
import { getMediaStorage } from "@/modules/media/runtime-storage";
import { postalCampaignUrl } from "@/modules/platform/postal-campaign";

import { deleteOnlinebrief, getOnlinebrief, submitOnlinebrief } from "./client";
import { createAcquisitionLetterPdf } from "./letter-pdf";
import { inferFederalState } from "./postal-region";
import { personalizePostalTemplate } from "./templates";

async function loadPlatformImage(
  mediaId: string | null,
  size: { width: number; height: number },
  fit: "inside" | "cover" = "inside",
) {
  if (!mediaId) return undefined;
  const asset = await findPublicMedia(mediaId);
  if (!asset || asset.tenantId)
    throw new Error(
      "Das ausgewählte Motiv gehört nicht zu den Plattformmedien.",
    );
  const source = await getMediaStorage().read(asset.storageKey);
  return new Uint8Array(
    await sharp(source)
      .trim()
      .resize({
        width: size.width,
        height: size.height,
        fit,
        withoutEnlargement: true,
      })
      .png()
      .toBuffer(),
  );
}

async function loadPlatformLogo(mediaId: string) {
  const asset = await findPublicMedia(mediaId);
  if (!asset || asset.tenantId)
    throw new Error(
      "Das ausgewählte Logo gehört nicht zu den Plattformmedien.",
    );
  const source = await getMediaStorage().read(asset.storageKey);
  const png = await sharp(source)
    .trim()
    .resize({
      width: 900,
      height: 220,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let luminance = 0;
  let weight = 0;
  for (let offset = 0; offset < data.length; offset += info.channels) {
    const alpha = data[offset + 3] / 255;
    if (alpha < 0.08) continue;
    luminance +=
      (data[offset] * 0.2126 +
        data[offset + 1] * 0.7152 +
        data[offset + 2] * 0.0722) *
      alpha;
    weight += alpha;
  }
  if (!weight)
    throw new Error("Das ausgewählte Logo enthält keine sichtbaren Pixel.");
  return {
    png: new Uint8Array(png),
    surface: luminance / weight > 180 ? ("dark" as const) : ("light" as const),
  };
}

async function findPostalLead(leadId: string) {
  const id = z.uuid().parse(leadId);
  const [lead] = await db
    .select()
    .from(salesLeads)
    .where(eq(salesLeads.id, id))
    .limit(1);
  if (!lead) throw new Error("Der Akquise-Kontakt wurde nicht gefunden.");
  if (!lead.street || !lead.postalCode || !lead.city)
    throw new Error(
      "Für den Brief fehlen Straße, PLZ oder Ort in der Kundenakte.",
    );
  return {
    ...lead,
    street: lead.street,
    postalCode: lead.postalCode,
    city: lead.city,
  };
}

export function onlinebriefConfiguration() {
  return {
    configured: Boolean(env.ONLINEBRIEF_API_KEY && env.ONLINEBRIEF_API_SECRET),
    mode: env.ONLINEBRIEF_MODE,
  };
}

export async function listPostalDispatches(leadId?: string) {
  const query = db
    .select({
      dispatch: postalDispatches,
      companyName: salesLeads.companyName,
    })
    .from(postalDispatches)
    .innerJoin(salesLeads, eq(salesLeads.id, postalDispatches.leadId));
  const rows = leadId
    ? await query
        .where(eq(postalDispatches.leadId, z.uuid().parse(leadId)))
        .orderBy(desc(postalDispatches.createdAt))
    : await query.orderBy(desc(postalDispatches.createdAt)).limit(200);
  return rows.map((row) => ({ ...row.dispatch, companyName: row.companyName }));
}

export async function getPostalCampaignAnalytics() {
  const rows = await db
    .select({
      leadId: salesLeads.id,
      companyName: salesLeads.companyName,
      postalCode: salesLeads.postalCode,
      status: salesLeads.status,
      response: salesLeads.postalResponse,
      firstViewedAt: salesLeads.postalLandingFirstViewedAt,
      viewCount: salesLeads.postalLandingViewCount,
      mode: postalDispatches.mode,
    })
    .from(postalDispatches)
    .innerJoin(salesLeads, eq(salesLeads.id, postalDispatches.leadId))
    .where(eq(postalDispatches.status, "submitted"));
  const leads = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const current = leads.get(row.leadId);
    if (!current || (current.mode === "test" && row.mode === "live"))
      leads.set(row.leadId, row);
  }
  const recipients = [...leads.values()];
  const viewed = recipients.filter((row) => row.firstViewedAt).length;
  const responded = recipients.filter((row) => row.response).length;
  const won = recipients.filter((row) => row.status === "won").length;
  const regions = new Map<
    string,
    { recipients: number; viewed: number; responded: number; won: number }
  >();
  for (const row of recipients) {
    const region = inferFederalState(row.postalCode) ?? "Nicht eindeutig";
    const current = regions.get(region) ?? {
      recipients: 0,
      viewed: 0,
      responded: 0,
      won: 0,
    };
    current.recipients += 1;
    if (row.firstViewedAt) current.viewed += 1;
    if (row.response) current.responded += 1;
    if (row.status === "won") current.won += 1;
    regions.set(region, current);
  }
  const total = recipients.length;
  const rate = (value: number) =>
    total ? Math.round((value / total) * 100) : 0;
  return {
    recipients: total,
    liveRecipients: recipients.filter((row) => row.mode === "live").length,
    testRecipients: recipients.filter((row) => row.mode === "test").length,
    viewed,
    responded,
    won,
    viewRate: rate(viewed),
    responseRate: rate(responded),
    winRate: rate(won),
    regions: [...regions.entries()]
      .map(([name, values]) => ({ name, ...values }))
      .sort(
        (a, b) => b.recipients - a.recipients || a.name.localeCompare(b.name),
      ),
  };
}

export async function preparePostalDispatch(input: {
  leadId: string;
  actorUserId: string;
  color: boolean;
  kicker: string;
  headline: string;
  bodyText: string;
  logoMediaId: string;
  imageMediaId: string;
}) {
  const content = z
    .object({
      headline: z.string().trim().min(10).max(160),
      kicker: z.string().trim().min(3).max(120),
      bodyText: z.string().trim().min(80).max(1_200),
      logoMediaId: z.union([z.literal(""), z.uuid()]),
      imageMediaId: z.union([z.literal(""), z.uuid()]),
    })
    .parse(input);
  const logoId = content.logoMediaId || (await findPlatformLogoId());
  if (!logoId)
    throw new Error(
      "Bitte wähle ein Briefkopf-Logo. Plattformlogos verwaltest du unter Medien.",
    );
  const [lead, sender, brandLogo, heroImagePng] = await Promise.all([
    findPostalLead(input.leadId),
    findPlatformLegalProfile(),
    loadPlatformLogo(logoId),
    loadPlatformImage(
      content.imageMediaId || null,
      {
        width: 1_100,
        height: 150,
      },
      "cover",
    ),
  ]);
  if (!sender)
    throw new Error(
      "Bitte vervollständige zuerst die Anbieterangaben unter Rechtliches.",
    );
  const dispatchId = createId();
  const bytes = await createAcquisitionLetterPdf({
    brandLogoPng: brandLogo.png,
    brandLogoSurface: brandLogo.surface,
    heroImagePng,
    createdAt: new Date(),
    kicker: personalizePostalTemplate(content.kicker, lead),
    headline: personalizePostalTemplate(content.headline, lead),
    bodyText: personalizePostalTemplate(content.bodyText, lead),
    leadId: lead.id,
    campaignUrl: postalCampaignUrl(lead.id),
    recipient: {
      companyName: lead.companyName,
      contactName: lead.contactName,
      street: lead.street,
      postalCode: lead.postalCode,
      city: lead.city,
      country: lead.country,
    },
    sender: {
      companyName: sender.data.companyName,
      representativeName: sender.data.representativeName,
      street: sender.data.street,
      postalCode: sender.data.postalCode,
      city: sender.data.city,
      email: sender.data.email,
    },
  });
  const storageKey = `platform/postal/${lead.id}/${dispatchId}.pdf`;
  const originalName = `fahrseiten-akquise-${lead.companyName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)}.pdf`;
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  await getMediaStorage().write(storageKey, bytes);
  try {
    await db.transaction(async (tx) => {
      await tx.insert(postalDispatches).values({
        id: dispatchId,
        leadId: lead.id,
        mode: env.ONLINEBRIEF_MODE,
        color: input.color,
        storageKey,
        originalName,
        sha256,
        byteSize: bytes.length,
        createdByUserId: input.actorUserId,
      });
      await tx.insert(salesActivities).values({
        id: createId(),
        leadId: lead.id,
        actorUserId: input.actorUserId,
        activityType: "postal_letter_prepared",
        note: `Akquisebrief für OnlineBrief24 im ${env.ONLINEBRIEF_MODE === "test" ? "Testmodus" : "Livemodus"} vorbereitet.`,
      });
    });
  } catch (error) {
    await getMediaStorage()
      .delete(storageKey)
      .catch(() => undefined);
    throw error;
  }
  return dispatchId;
}

export async function preparePostalDispatchBatch(input: {
  leadIds: string[];
  actorUserId: string;
  color: boolean;
  kicker: string;
  headline: string;
  bodyText: string;
  logoMediaId: string;
  imageMediaId: string;
}) {
  const leadIds = z.array(z.uuid()).min(1).max(50).parse(input.leadIds);
  const uniqueLeadIds = [...new Set(leadIds)];
  const prepared: string[] = [];
  const failed: { leadId: string; reason: string }[] = [];
  for (const leadId of uniqueLeadIds) {
    try {
      prepared.push(
        await preparePostalDispatch({
          ...input,
          leadId,
        }),
      );
    } catch (error) {
      failed.push({
        leadId,
        reason:
          error instanceof Error
            ? error.message
            : "Der Brief konnte nicht vorbereitet werden.",
      });
    }
  }
  return { prepared, failed };
}

export async function submitPreparedPostalDispatch(input: {
  dispatchId: string;
  actorUserId: string;
  liveConfirmation: string;
}) {
  const id = z.uuid().parse(input.dispatchId);
  const [dispatch] = await db
    .select()
    .from(postalDispatches)
    .where(eq(postalDispatches.id, id))
    .limit(1);
  if (!dispatch)
    throw new Error("Der vorbereitete Brief wurde nicht gefunden.");
  if (dispatch.status !== "prepared")
    throw new Error(
      "Dieser Brief wurde bereits übertragen oder ist fehlgeschlagen.",
    );
  if (!env.ONLINEBRIEF_API_KEY || !env.ONLINEBRIEF_API_SECRET)
    throw new Error(
      "ONLINEBRIEF_API_KEY und ONLINEBRIEF_API_SECRET sind noch nicht konfiguriert.",
    );
  const bytes = await getMediaStorage().read(dispatch.storageKey);
  try {
    const result = await submitOnlinebrief({
      credentials: {
        apiKey: env.ONLINEBRIEF_API_KEY,
        apiSecret: env.ONLINEBRIEF_API_SECRET,
        mode: dispatch.mode,
      },
      pdf: bytes,
      filename: dispatch.originalName,
      leadId: dispatch.leadId,
      color: dispatch.color,
      liveConfirmation: input.liveConfirmation,
    });
    await db.transaction(async (tx) => {
      await tx
        .update(postalDispatches)
        .set({
          status: "submitted",
          providerJobId: String(result.data.id),
          providerStatus: result.data.status,
          submittedAt: new Date(),
          errorCode: null,
        })
        .where(eq(postalDispatches.id, dispatch.id));
      await tx.insert(salesActivities).values({
        id: createId(),
        leadId: dispatch.leadId,
        actorUserId: input.actorUserId,
        activityType: "postal_letter_submitted",
        note: `OnlineBrief24-Auftrag ${result.data.id} (${dispatch.mode}) übertragen.`,
      });
    });
    return result.data.id;
  } catch (error) {
    await db
      .update(postalDispatches)
      .set({
        status: "failed",
        errorCode:
          error instanceof Error ? error.message.slice(0, 160) : "unknown",
      })
      .where(eq(postalDispatches.id, dispatch.id));
    throw error;
  }
}

export async function findPostalDispatchForDownload(dispatchId: string) {
  const [dispatch] = await db
    .select()
    .from(postalDispatches)
    .where(eq(postalDispatches.id, z.uuid().parse(dispatchId)))
    .limit(1);
  return dispatch ?? null;
}

export async function deletePostalDispatch(input: {
  dispatchId: string;
  actorUserId: string;
}) {
  const id = z.uuid().parse(input.dispatchId);
  const [dispatch] = await db
    .select()
    .from(postalDispatches)
    .where(eq(postalDispatches.id, id))
    .limit(1);
  if (!dispatch) throw new Error("Der Briefvorgang wurde nicht gefunden.");

  if (dispatch.status === "submitted") {
    if (
      !dispatch.providerJobId ||
      !env.ONLINEBRIEF_API_KEY ||
      !env.ONLINEBRIEF_API_SECRET
    )
      throw new Error(
        "Der übertragene Auftrag kann ohne Anbieter-ID und OnlineBrief24-Zugang nicht gelöscht werden.",
      );
    await deleteOnlinebrief(
      {
        apiKey: env.ONLINEBRIEF_API_KEY,
        apiSecret: env.ONLINEBRIEF_API_SECRET,
        mode: dispatch.mode,
      },
      dispatch.providerJobId,
    );
  }

  await getMediaStorage().delete(dispatch.storageKey);
  await db.transaction(async (tx) => {
    await tx
      .delete(postalDispatches)
      .where(eq(postalDispatches.id, dispatch.id));
    await tx.insert(salesActivities).values({
      id: createId(),
      leadId: dispatch.leadId,
      actorUserId: input.actorUserId,
      activityType: "postal_letter_deleted",
      note: dispatch.providerJobId
        ? `OnlineBrief24-Auftrag ${dispatch.providerJobId} und lokales PDF wurden gelöscht.`
        : "Der vorbereitete Brief und das lokale PDF wurden gelöscht.",
    });
  });
  return { providerDeleted: dispatch.status === "submitted" };
}

export async function setPostalDispatchArchived(input: {
  dispatchId: string;
  archived: boolean;
  actorUserId: string;
}) {
  const id = z.uuid().parse(input.dispatchId);
  const [dispatch] = await db
    .select({ leadId: postalDispatches.leadId })
    .from(postalDispatches)
    .where(eq(postalDispatches.id, id))
    .limit(1);
  if (!dispatch) throw new Error("Der Briefvorgang wurde nicht gefunden.");
  await db.transaction(async (tx) => {
    await tx
      .update(postalDispatches)
      .set({ archivedAt: input.archived ? new Date() : null })
      .where(eq(postalDispatches.id, id));
    await tx.insert(salesActivities).values({
      id: createId(),
      leadId: dispatch.leadId,
      actorUserId: input.actorUserId,
      activityType: input.archived
        ? "postal_letter_archived"
        : "postal_letter_restored",
      note: input.archived
        ? "Der Briefvorgang wurde archiviert."
        : "Der Briefvorgang wurde aus dem Archiv wiederhergestellt.",
    });
  });
}

export async function syncPostalDispatchStatuses(input?: {
  dispatchId?: string;
  force?: boolean;
}) {
  if (!env.ONLINEBRIEF_API_KEY || !env.ONLINEBRIEF_API_SECRET)
    return { checked: 0, updated: 0, failed: 0 };
  const credentials = {
    apiKey: env.ONLINEBRIEF_API_KEY,
    apiSecret: env.ONLINEBRIEF_API_SECRET,
  };
  const staleBefore = new Date(Date.now() - 4 * 60_000);
  const conditions = [
    eq(postalDispatches.status, "submitted"),
    isNotNull(postalDispatches.providerJobId),
    or(
      isNull(postalDispatches.providerStatus),
      notInArray(postalDispatches.providerStatus, [
        "done",
        "canceled",
        "nicht_mehr_vorhanden",
      ]),
    )!,
  ];
  if (input?.dispatchId)
    conditions.push(eq(postalDispatches.id, z.uuid().parse(input.dispatchId)));
  if (!input?.force)
    conditions.push(
      or(
        isNull(postalDispatches.providerCheckedAt),
        lt(postalDispatches.providerCheckedAt, staleBefore),
      )!,
    );
  const dispatches = await db
    .select()
    .from(postalDispatches)
    .where(and(...conditions))
    .orderBy(desc(postalDispatches.submittedAt))
    .limit(input?.dispatchId ? 1 : 10);
  const results = await Promise.allSettled(
    dispatches.map(async (dispatch) => {
      const remote = await getOnlinebrief(
        {
          ...credentials,
          mode: dispatch.mode,
        },
        dispatch.providerJobId!,
      );
      const providerStatus = remote?.status ?? "nicht_mehr_vorhanden";
      await db
        .update(postalDispatches)
        .set({ providerStatus, providerCheckedAt: new Date() })
        .where(eq(postalDispatches.id, dispatch.id));
      return providerStatus !== dispatch.providerStatus;
    }),
  );
  const updated = results.filter(
    (result) => result.status === "fulfilled" && result.value,
  ).length;
  const failed = results.filter(
    (result) => result.status === "rejected",
  ).length;
  return { checked: dispatches.length, updated, failed };
}

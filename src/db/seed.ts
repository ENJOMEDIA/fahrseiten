import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { parseServerEnv } from "@/config/env-schema";
import { hashPassword } from "@/modules/auth/password";

import {
  auditLogs,
  courseDates,
  courses,
  domains,
  featureFlags,
  licenseClasses,
  locations,
  navigationItems,
  openingHours,
  pageBlocks,
  pageVersions,
  plans,
  planFeatures,
  priceGroups,
  priceItems,
  seoSettings,
  sitePages,
  sites,
  subscriptions,
  teamMembers,
  tenantFeatures,
  tenantMemberships,
  tenants,
  testimonials,
  themeSettings,
  users,
  vehicles,
} from "./schema";

const ids = {
  platformOwner: "00000000-0000-4000-8000-000000000001",
  tenantOwner: "00000000-0000-4000-8000-000000000002",
  demoTenant: "10000000-0000-4000-8000-000000000001",
  isolationTenant: "10000000-0000-4000-8000-000000000002",
  demoSite: "20000000-0000-4000-8000-000000000001",
  demoDomain: "30000000-0000-4000-8000-000000000001",
  localPlan: "40000000-0000-4000-8000-000000000001",
  subscription: "50000000-0000-4000-8000-000000000001",
  builderFeature: "60000000-0000-4000-8000-000000000001",
  schedulingFeature: "60000000-0000-4000-8000-000000000002",
  audit: "70000000-0000-4000-8000-000000000001",
  homePage: "80000000-0000-4000-8000-000000000001",
  aboutPage: "80000000-0000-4000-8000-000000000002",
  contactPage: "80000000-0000-4000-8000-000000000003",
  homeVersion: "81000000-0000-4000-8000-000000000001",
  aboutVersion: "81000000-0000-4000-8000-000000000002",
  contactVersion: "81000000-0000-4000-8000-000000000003",
} as const;

const env = parseServerEnv(process.env);
const connection = await mysql.createConnection(env.DATABASE_URL);
const db = drizzle({ client: connection });
const demoPasswordHash = await hashPassword("Demo-FahrSeiten-2026!");

try {
  await db.transaction(async (tx) => {
    await tx
      .insert(tenants)
      .values([
        {
          id: ids.demoTenant,
          name: "Fahrschule Morgenrot (Demo)",
          slug: "morgenrot-demo",
        },
        {
          id: ids.isolationTenant,
          name: "Fahrschule Nordstern (Test)",
          slug: "nordstern-test",
        },
      ])
      .onDuplicateKeyUpdate({ set: { status: "active" } });

    await tx
      .insert(users)
      .values([
        {
          id: ids.platformOwner,
          email: "plattform@fahrseiten.local",
          displayName: "Lokale Plattformverwaltung",
          passwordHash: demoPasswordHash,
          platformRole: "platform_owner",
        },
        {
          id: ids.tenantOwner,
          email: "inhaber@morgenrot.local",
          displayName: "Mara Beispiel",
          passwordHash: demoPasswordHash,
        },
      ])
      .onDuplicateKeyUpdate({ set: { active: true } });

    await tx
      .insert(tenantMemberships)
      .values({
        tenantId: ids.demoTenant,
        userId: ids.tenantOwner,
        role: "tenant_owner",
      })
      .onDuplicateKeyUpdate({ set: { role: "tenant_owner", active: true } });

    await tx
      .insert(sites)
      .values({
        id: ids.demoSite,
        tenantId: ids.demoTenant,
        name: "Morgenrot Demo-Website",
      })
      .onDuplicateKeyUpdate({ set: { name: "Morgenrot Demo-Website" } });

    await tx
      .insert(domains)
      .values({
        id: ids.demoDomain,
        tenantId: ids.demoTenant,
        hostname: "demo.fahrseiten.local",
        status: "active",
        primary: true,
        sslStatus: "local",
      })
      .onDuplicateKeyUpdate({ set: { status: "active", primary: true } });

    await tx
      .insert(sitePages)
      .values([
        {
          id: ids.homePage,
          tenantId: ids.demoTenant,
          siteId: ids.demoSite,
          slug: "",
          title: "Start",
          status: "published",
          publishedVersionId: ids.homeVersion,
        },
        {
          id: ids.aboutPage,
          tenantId: ids.demoTenant,
          siteId: ids.demoSite,
          slug: "ueber-uns",
          title: "Über uns",
          status: "published",
          publishedVersionId: ids.aboutVersion,
        },
        {
          id: ids.contactPage,
          tenantId: ids.demoTenant,
          siteId: ids.demoSite,
          slug: "kontakt",
          title: "Kontakt",
          status: "published",
          publishedVersionId: ids.contactVersion,
        },
      ])
      .onDuplicateKeyUpdate({ set: { status: "published" } });

    await tx
      .insert(pageVersions)
      .values([
        {
          id: ids.homeVersion,
          tenantId: ids.demoTenant,
          pageId: ids.homePage,
          version: 1,
          state: "published",
          title: "Sicher ans Ziel",
          createdByUserId: ids.tenantOwner,
        },
        {
          id: ids.aboutVersion,
          tenantId: ids.demoTenant,
          pageId: ids.aboutPage,
          version: 1,
          state: "published",
          title: "Über uns",
          createdByUserId: ids.tenantOwner,
        },
        {
          id: ids.contactVersion,
          tenantId: ids.demoTenant,
          pageId: ids.contactPage,
          version: 1,
          state: "published",
          title: "Kontakt",
          createdByUserId: ids.tenantOwner,
        },
      ])
      .onDuplicateKeyUpdate({ set: { state: "published" } });

    await tx
      .insert(pageBlocks)
      .values([
        {
          id: "82000000-0000-4000-8000-000000000001",
          tenantId: ids.demoTenant,
          versionId: ids.homeVersion,
          blockType: "hero",
          position: 0,
          properties: {
            type: "hero",
            eyebrow: "Fiktive Demo-Fahrschule",
            heading: "Sicher ans Ziel – Schritt für Schritt",
            text: "Persönliche Ausbildung, klare Abläufe und ein ruhiges Lernumfeld.",
            actionLabel: "Kontakt aufnehmen",
            actionHref: "/kontakt",
          },
        },
        {
          id: "82000000-0000-4000-8000-000000000002",
          tenantId: ids.demoTenant,
          versionId: ids.homeVersion,
          blockType: "benefits",
          position: 1,
          properties: {
            type: "benefits",
            heading: "Darum Morgenrot",
            items: [
              {
                title: "Persönlich",
                text: "Feste Ansprechpersonen begleiten dich.",
              },
              {
                title: "Transparent",
                text: "Leistungen und nächste Schritte bleiben nachvollziehbar.",
              },
              { title: "Flexibel", text: "Lernen passend zu deinem Alltag." },
            ],
          },
        },
        {
          id: "82000000-0000-4000-8000-000000000003",
          tenantId: ids.demoTenant,
          versionId: ids.homeVersion,
          blockType: "faq",
          position: 2,
          properties: {
            type: "faq",
            heading: "Häufige Fragen",
            items: [
              {
                question: "Ist das eine echte Fahrschule?",
                answer: "Nein. Alle Inhalte sind fiktive Demo-Daten.",
              },
            ],
          },
        },
        {
          id: "82000000-0000-4000-8000-000000000004",
          tenantId: ids.demoTenant,
          versionId: ids.aboutVersion,
          blockType: "text_image",
          position: 0,
          properties: {
            type: "text_image",
            heading: "Lernen mit Ruhe und Struktur",
            paragraphs: [
              "Morgenrot ist eine vollständig fiktive Fahrschule für die lokale Produktdemo.",
            ],
            imageAlt: "Abstrakte Demo-Bildfläche",
            imagePosition: "right",
          },
        },
        {
          id: "82000000-0000-4000-8000-000000000005",
          tenantId: ids.demoTenant,
          versionId: ids.contactVersion,
          blockType: "cta",
          position: 0,
          properties: {
            type: "cta",
            heading: "Lass uns sprechen",
            text: "Diese Kontaktdaten sind fiktiv.",
            actionLabel: "E-Mail schreiben",
            actionHref: "mailto:hallo@morgenrot.invalid",
          },
        },
      ])
      .onDuplicateKeyUpdate({ set: { visible: true } });

    await tx
      .insert(navigationItems)
      .values([
        {
          id: "83000000-0000-4000-8000-000000000001",
          tenantId: ids.demoTenant,
          siteId: ids.demoSite,
          pageId: ids.homePage,
          label: "Start",
          position: 0,
        },
        {
          id: "83000000-0000-4000-8000-000000000002",
          tenantId: ids.demoTenant,
          siteId: ids.demoSite,
          pageId: ids.aboutPage,
          label: "Über uns",
          position: 1,
        },
        {
          id: "83000000-0000-4000-8000-000000000003",
          tenantId: ids.demoTenant,
          siteId: ids.demoSite,
          pageId: ids.contactPage,
          label: "Kontakt",
          position: 2,
        },
      ])
      .onDuplicateKeyUpdate({ set: { visible: true } });

    await tx
      .insert(themeSettings)
      .values({ tenantId: ids.demoTenant, siteId: ids.demoSite })
      .onDuplicateKeyUpdate({ set: { themeKey: "calm_cyan" } });
    await tx
      .insert(seoSettings)
      .values([
        {
          id: "84000000-0000-4000-8000-000000000001",
          tenantId: ids.demoTenant,
          pageId: ids.homePage,
          title: "Fahrschule Morgenrot – Demo",
          description: "Fiktive Demo-Fahrschule für FahrSeiten.",
          noIndex: true,
        },
        {
          id: "84000000-0000-4000-8000-000000000002",
          tenantId: ids.demoTenant,
          pageId: ids.aboutPage,
          title: "Über uns – Fahrschule Morgenrot",
          noIndex: true,
        },
        {
          id: "84000000-0000-4000-8000-000000000003",
          tenantId: ids.demoTenant,
          pageId: ids.contactPage,
          title: "Kontakt – Fahrschule Morgenrot",
          noIndex: true,
        },
      ])
      .onDuplicateKeyUpdate({ set: { noIndex: true } });

    await tx
      .insert(licenseClasses)
      .values([
        {
          id: "85000000-0000-4000-8000-000000000001",
          tenantId: ids.demoTenant,
          key: "B",
          title: "Pkw",
          description: "Fiktive Beispielausbildung für Pkw.",
          minimumAge: 18,
          position: 0,
        },
        {
          id: "85000000-0000-4000-8000-000000000002",
          tenantId: ids.demoTenant,
          key: "A",
          title: "Motorrad",
          description: "Fiktive Beispielausbildung für Motorräder.",
          minimumAge: 24,
          position: 1,
        },
      ])
      .onDuplicateKeyUpdate({ set: { active: true } });
    await tx
      .insert(priceGroups)
      .values({
        id: "86000000-0000-4000-8000-000000000001",
        tenantId: ids.demoTenant,
        title: "Klasse B",
      })
      .onDuplicateKeyUpdate({ set: { active: true } });
    await tx
      .insert(priceItems)
      .values([
        {
          id: "86100000-0000-4000-8000-000000000001",
          tenantId: ids.demoTenant,
          priceGroupId: "86000000-0000-4000-8000-000000000001",
          label: "Grundbetrag",
          amount: "499.00",
          currency: "EUR",
          position: 0,
        },
        {
          id: "86100000-0000-4000-8000-000000000002",
          tenantId: ids.demoTenant,
          priceGroupId: "86000000-0000-4000-8000-000000000001",
          label: "Fahrstunde",
          amount: "69.00",
          currency: "EUR",
          unit: "45 Minuten",
          position: 1,
        },
      ])
      .onDuplicateKeyUpdate({ set: { active: true } });
    await tx
      .insert(courses)
      .values({
        id: "87000000-0000-4000-8000-000000000001",
        tenantId: ids.demoTenant,
        title: "Theorie-Intensivkurs",
        description: "Fiktiver Kompaktkurs ohne Buchungsfunktion.",
      })
      .onDuplicateKeyUpdate({ set: { active: true } });
    await tx
      .insert(courseDates)
      .values({
        id: "87100000-0000-4000-8000-000000000001",
        tenantId: ids.demoTenant,
        courseId: "87000000-0000-4000-8000-000000000001",
        startsAt: new Date("2026-10-12T14:00:00.000Z"),
        endsAt: new Date("2026-10-12T17:00:00.000Z"),
        timezone: "Europe/Berlin",
      })
      .onDuplicateKeyUpdate({ set: { active: true } });
    await tx
      .insert(teamMembers)
      .values({
        id: "88000000-0000-4000-8000-000000000001",
        tenantId: ids.demoTenant,
        name: "Mara Beispiel",
        role: "Fahrlehrerin",
        bio: "Fiktive Person für die lokale Produktdemo.",
        qualifications: ["Klassen A und B"],
      })
      .onDuplicateKeyUpdate({ set: { active: true } });
    await tx
      .insert(vehicles)
      .values({
        id: "89000000-0000-4000-8000-000000000001",
        tenantId: ids.demoTenant,
        name: "Demo Kompakt",
        category: "Pkw",
        transmission: "automatic",
        description: "Fiktives Schulungsfahrzeug.",
      })
      .onDuplicateKeyUpdate({ set: { active: true } });
    await tx
      .insert(locations)
      .values({
        id: "8a000000-0000-4000-8000-000000000001",
        tenantId: ids.demoTenant,
        name: "Morgenrot Lernstudio",
        street: "Beispielweg 1",
        postalCode: "00000",
        city: "Musterstadt",
        phone: "+49 30 0000000",
        email: "hallo@morgenrot.invalid",
      })
      .onDuplicateKeyUpdate({ set: { active: true } });
    await tx
      .insert(openingHours)
      .values([
        {
          id: "8a100000-0000-4000-8000-000000000001",
          tenantId: ids.demoTenant,
          locationId: "8a000000-0000-4000-8000-000000000001",
          weekday: 1,
          opensAt: "10:00",
          closesAt: "18:00",
        },
        {
          id: "8a100000-0000-4000-8000-000000000002",
          tenantId: ids.demoTenant,
          locationId: "8a000000-0000-4000-8000-000000000001",
          weekday: 7,
          closed: true,
        },
      ])
      .onDuplicateKeyUpdate({ set: { active: true } });
    await tx
      .insert(testimonials)
      .values({
        id: "8b000000-0000-4000-8000-000000000001",
        tenantId: ids.demoTenant,
        displayName: "Alex Demo",
        quote: "Die Abläufe waren klar und verständlich erklärt.",
        rating: 5,
        sourceLabel: "manuell gepflegte Demo",
      })
      .onDuplicateKeyUpdate({ set: { active: true } });

    await tx
      .insert(plans)
      .values({
        id: ids.localPlan,
        key: "local_demo",
        internalName: "Lokaler Demo-Plan",
        publicName: "Lokaler Demo-Plan",
      })
      .onDuplicateKeyUpdate({ set: { active: true } });

    await tx
      .insert(featureFlags)
      .values([
        {
          id: ids.builderFeature,
          key: "website_builder",
          title: "Website-Builder",
          defaultStatus: "enabled",
        },
        {
          id: ids.schedulingFeature,
          key: "lesson_booking",
          title: "Terminbuchung",
          defaultStatus: "coming_soon",
        },
        {
          id: "60000000-0000-4000-8000-000000000003",
          key: "lesson_reminders",
          title: "Fahrstundenerinnerungen",
          defaultStatus: "coming_soon",
        },
        {
          id: "60000000-0000-4000-8000-000000000004",
          key: "advanced_crm",
          title: "Erweitertes CRM",
          defaultStatus: "coming_soon",
        },
        {
          id: "60000000-0000-4000-8000-000000000005",
          key: "sms",
          title: "SMS",
          defaultStatus: "coming_soon",
        },
        {
          id: "60000000-0000-4000-8000-000000000006",
          key: "whatsapp",
          title: "WhatsApp",
          defaultStatus: "coming_soon",
        },
        {
          id: "60000000-0000-4000-8000-000000000007",
          key: "payments",
          title: "Online-Zahlungen",
          defaultStatus: "coming_soon",
        },
        {
          id: "60000000-0000-4000-8000-000000000008",
          key: "analytics",
          title: "Statistiken",
          defaultStatus: "coming_soon",
        },
        {
          id: "60000000-0000-4000-8000-000000000009",
          key: "ad_campaigns",
          title: "Anzeigenkampagnen",
          defaultStatus: "coming_soon",
        },
      ])
      .onDuplicateKeyUpdate({
        set: { description: "Lokale, vollständig fiktive Demo-Funktion" },
      });

    await tx
      .insert(planFeatures)
      .values({
        planId: ids.localPlan,
        featureId: ids.builderFeature,
        status: "enabled",
      })
      .onDuplicateKeyUpdate({ set: { status: "enabled" } });
    await tx
      .insert(planFeatures)
      .values({
        planId: ids.localPlan,
        featureId: ids.schedulingFeature,
        status: "coming_soon",
      })
      .onDuplicateKeyUpdate({ set: { status: "coming_soon" } });

    await tx
      .insert(subscriptions)
      .values({
        id: ids.subscription,
        tenantId: ids.demoTenant,
        planId: ids.localPlan,
        status: "active",
      })
      .onDuplicateKeyUpdate({ set: { status: "active" } });

    await tx
      .insert(tenantFeatures)
      .values({
        tenantId: ids.demoTenant,
        featureId: ids.builderFeature,
        status: "enabled",
        reason: "Lokaler Demo-Seed",
      })
      .onDuplicateKeyUpdate({
        set: { status: "enabled", reason: "Lokaler Demo-Seed" },
      });

    await tx
      .insert(auditLogs)
      .values({
        id: ids.audit,
        tenantId: ids.demoTenant,
        actorUserId: ids.platformOwner,
        action: "demo.seeded",
        entityType: "tenant",
        entityId: ids.demoTenant,
        metadata: { source: "local_seed" },
      })
      .onDuplicateKeyUpdate({ set: { action: "demo.seeded" } });
  });

  console.info("Fiktive lokale Demodaten wurden idempotent angelegt.");
} finally {
  await connection.end();
}

import { parseStoredBlocks, type StoredBlock } from "./block-schema";

export type PageVersion = {
  id: string;
  version: number;
  state: "draft" | "published" | "archived";
  title: string;
  blocks: StoredBlock[];
};

export type PageAggregate = {
  id: string;
  tenantId: string;
  slug: string;
  publishedVersionId?: string;
  versions: PageVersion[];
};

export function publishDraft(
  page: PageAggregate,
  draftId: string,
): PageAggregate {
  const draft = page.versions.find(
    (version) => version.id === draftId && version.state === "draft",
  );
  if (!draft)
    throw new Error(
      "Der Entwurf gehört nicht zu dieser Seite oder ist nicht veröffentlichbar.",
    );

  const blocks = parseStoredBlocks(draft.blocks);
  const versions = page.versions.map((version) => {
    if (version.id === draft.id)
      return { ...version, state: "published" as const, blocks };
    if (version.state === "published")
      return { ...version, state: "archived" as const };
    return version;
  });
  return { ...page, publishedVersionId: draft.id, versions };
}

export function restoreVersion(
  page: PageAggregate,
  versionId: string,
  newId: string,
): PageAggregate {
  const source = page.versions.find((version) => version.id === versionId);
  if (!source)
    throw new Error("Die gewählte Version gehört nicht zu dieser Seite.");
  const nextVersion =
    Math.max(...page.versions.map((version) => version.version), 0) + 1;
  return {
    ...page,
    versions: [
      ...page.versions,
      {
        ...source,
        id: newId,
        version: nextVersion,
        state: "draft",
        blocks: structuredClone(source.blocks),
      },
    ],
  };
}

import { describe, expect, it } from "vitest";

import {
  archiveImage,
  selectTenantImage,
  uploadImage,
  type MediaAssetRecord,
  type MediaRepository,
} from "./service";
import type { MediaStorage } from "./storage";

const png = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 2, 0,
  0, 0, 3,
]);
function harness(usages = 0) {
  const assets = new Map<string, MediaAssetRecord>();
  const storage: MediaStorage = {
    async write() {},
    async read() {
      return png;
    },
    async delete() {},
  };
  const repository: MediaRepository = {
    async create(asset) {
      assets.set(asset.id, asset);
    },
    async find(tenantId, id) {
      const asset = assets.get(id);
      return asset?.tenantId === tenantId ? asset : null;
    },
    async usageCount() {
      return usages;
    },
    async archive(tenantId, id) {
      const asset = assets.get(id);
      if (asset?.tenantId === tenantId) asset.archivedAt = new Date();
    },
  };
  return { assets, storage, repository };
}

describe("media service", () => {
  it("validates signatures and stores tenant-partitioned images", async () => {
    const { storage, repository } = harness();
    const asset = await uploadImage({
      tenantId: "tenant-a",
      bytes: png,
      metadata: {
        originalName: "demo.png",
        claimedMimeType: "image/png",
        altText: "Demo",
      },
      storage,
      repository,
    });
    expect(asset.storageKey).toMatch(/^tenant-a\/[\w-]+\.png$/);
    expect(asset).toMatchObject({ width: 2, height: 3 });
  });
  it("rejects disguised executable content", async () => {
    const { storage, repository } = harness();
    await expect(
      uploadImage({
        tenantId: "tenant-a",
        bytes: new TextEncoder().encode("<script>alert(1)</script>"),
        metadata: {
          originalName: "x.png",
          claimedMimeType: "image/png",
          altText: "",
        },
        storage,
        repository,
      }),
    ).rejects.toThrow();
  });
  it("accepts a self-contained SVG logo", async () => {
    const { storage, repository } = harness();
    const asset = await uploadImage({
      tenantId: "tenant-a",
      bytes: new TextEncoder().encode(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80"><path fill="#000" d="M0 0h320v80H0z"/></svg>',
      ),
      metadata: {
        originalName: "logo.svg",
        claimedMimeType: "image/svg+xml",
        altText: "Logo",
      },
      storage,
      repository,
    });
    expect(asset.storageKey).toMatch(/^tenant-a\/[\w-]+\.svg$/);
    expect(asset).toMatchObject({ width: 320, height: 80 });
  });
  it("accepts a signature-checked ICO favicon with common MIME aliases", async () => {
    const { storage, repository } = harness();
    const ico = new Uint8Array([
      0, 0, 1, 0, 1, 0, 32, 32, 0, 0, 1, 0, 32, 0, 4, 0, 0, 0, 22, 0, 0, 0, 0,
      0, 0, 0,
    ]);
    const asset = await uploadImage({
      tenantId: "tenant-a",
      bytes: ico,
      metadata: {
        originalName: "favicon.ico",
        claimedMimeType: "image/vnd.microsoft.icon",
        altText: "Favicon",
      },
      storage,
      repository,
    });
    expect(asset.storageKey).toMatch(/^tenant-a\/[\w-]+\.ico$/);
    expect(asset).toMatchObject({
      width: 32,
      height: 32,
      mimeType: "image/x-icon",
    });
  });
  it("rejects active or externally linked SVG content", async () => {
    const { storage, repository } = harness();
    await expect(
      uploadImage({
        tenantId: "tenant-a",
        bytes: new TextEncoder().encode(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><script>alert(1)</script></svg>',
        ),
        metadata: {
          originalName: "unsafe.svg",
          claimedMimeType: "image/svg+xml",
          altText: "Logo",
        },
        storage,
        repository,
      }),
    ).rejects.toThrow(/ausführbare/);
  });
  it("prevents cross-tenant selection", async () => {
    const { storage, repository } = harness();
    const asset = await uploadImage({
      tenantId: "tenant-a",
      bytes: png,
      metadata: {
        originalName: "demo.png",
        claimedMimeType: "image/png",
        altText: "Demo",
      },
      storage,
      repository,
    });
    await expect(
      selectTenantImage("tenant-b", asset.id, repository),
    ).rejects.toThrow(/nicht gefunden/);
  });
  it("warns before archiving used media", async () => {
    const { storage, repository } = harness(2);
    const asset = await uploadImage({
      tenantId: "tenant-a",
      bytes: png,
      metadata: {
        originalName: "demo.png",
        claimedMimeType: "image/png",
        altText: "Demo",
      },
      storage,
      repository,
    });
    await expect(
      archiveImage("tenant-a", asset.id, repository),
    ).rejects.toThrow(/2-mal/);
  });
});

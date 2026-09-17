export type InspectedImage = {
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  extension: "png" | "jpg" | "webp";
  width: number;
  height: number;
};

export function inspectImage(bytes: Uint8Array): InspectedImage {
  if (bytes.length < 24) throw new Error("Die Bilddatei ist unvollständig.");
  if (matches(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return {
      mimeType: "image/png",
      extension: "png",
      width: readU32(bytes, 16),
      height: readU32(bytes, 20),
    };
  }
  if (
    matches(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
  ) {
    const kind = new TextDecoder().decode(bytes.slice(12, 16));
    if (kind === "VP8X" && bytes.length >= 30)
      return {
        mimeType: "image/webp",
        extension: "webp",
        width: readU24LE(bytes, 24) + 1,
        height: readU24LE(bytes, 27) + 1,
      };
    throw new Error("Diese WebP-Variante kann nicht sicher geprüft werden.");
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
      if (
        [
          0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
          0xce, 0xcf,
        ].includes(marker)
      ) {
        return {
          mimeType: "image/jpeg",
          extension: "jpg",
          height: (bytes[offset + 5] << 8) + bytes[offset + 6],
          width: (bytes[offset + 7] << 8) + bytes[offset + 8],
        };
      }
      if (length < 2) break;
      offset += length + 2;
    }
  }
  throw new Error("Nur geprüfte PNG-, JPEG- und WebP-Bilder sind zulässig.");
}

function matches(bytes: Uint8Array, expected: number[]) {
  return expected.every((value, index) => bytes[index] === value);
}
function readU32(bytes: Uint8Array, offset: number) {
  return new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  ).getUint32(offset);
}
function readU24LE(bytes: Uint8Array, offset: number) {
  return bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16);
}

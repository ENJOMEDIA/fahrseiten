export function mediaPublicUrl(id: string) {
  const base = process.env.MEDIA_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  return base ? `${base}/${id}` : `/media/${id}`;
}

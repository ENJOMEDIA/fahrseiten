"use client";

import { useState } from "react";
import { cropTenantMedia } from "./actions";

export function MediaCropForm({
  mediaId,
  imageUrl,
  processable,
}: {
  mediaId: string;
  imageUrl: string;
  processable: boolean;
}) {
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [zoom, setZoom] = useState(100);
  const [aspect, setAspect] = useState("4:3");
  if (!processable)
    return (
      <p className="mt-3 text-xs text-slate-500">
        Vektorgrafiken und Favicons bleiben im Originalformat.
      </p>
    );
  return (
    <details className="mt-3 border-t border-slate-100 pt-3">
      <summary className="cursor-pointer text-sm font-semibold text-cyan-800">
        Zuschnitt & WebP anpassen
      </summary>
      <form action={cropTenantMedia} className="mt-3 space-y-3">
        <input name="mediaId" type="hidden" value={mediaId} />
        <div
          className={`relative overflow-hidden rounded-xl bg-slate-100 ${aspect === "1:1" ? "aspect-square" : aspect === "16:9" ? "aspect-video" : "aspect-[4/3]"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Vorschau des Bildzuschnitts"
            className="h-full w-full object-cover"
            src={imageUrl}
            style={{
              objectPosition: `${x}% ${y}%`,
              transform: `scale(${zoom / 100})`,
            }}
          />
        </div>
        <label className="block text-xs font-semibold">
          Format
          <select
            className="mt-1 w-full rounded-lg border p-2"
            name="cropAspect"
            onChange={(event) => setAspect(event.currentTarget.value)}
            value={aspect}
          >
            <option value="original">Original</option>
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="1:1">Quadratisch</option>
          </select>
        </label>
        <label className="block text-xs font-semibold">
          Horizontal
          <input
            className="block w-full"
            max="100"
            min="0"
            name="cropX"
            onChange={(event) => setX(Number(event.currentTarget.value))}
            type="range"
            value={x}
          />
        </label>
        <label className="block text-xs font-semibold">
          Vertikal
          <input
            className="block w-full"
            max="100"
            min="0"
            name="cropY"
            onChange={(event) => setY(Number(event.currentTarget.value))}
            type="range"
            value={y}
          />
        </label>
        <label className="block text-xs font-semibold">
          Zoom
          <input
            className="block w-full"
            max="200"
            min="100"
            name="cropZoom"
            onChange={(event) => setZoom(Number(event.currentTarget.value))}
            type="range"
            value={zoom}
          />
        </label>
        <button
          className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
          type="submit"
        >
          WebP neu erzeugen
        </button>
      </form>
    </details>
  );
}

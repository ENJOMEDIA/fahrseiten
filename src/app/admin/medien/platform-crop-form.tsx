"use client";

import { useState } from "react";
import { cropPlatformMedia } from "./actions";

export function PlatformCropForm({
  mediaId,
  imageUrl,
}: {
  mediaId: string;
  imageUrl: string;
}) {
  const [position, setPosition] = useState({
    x: 50,
    y: 50,
    zoom: 100,
    aspect: "16:9",
  });
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-sm font-semibold text-cyan-800">
        Zuschnitt bearbeiten
      </summary>
      <form action={cropPlatformMedia} className="mt-3 space-y-3">
        <input name="mediaId" type="hidden" value={mediaId} />
        <div
          className={
            position.aspect === "1:1"
              ? "relative aspect-square overflow-hidden rounded-xl"
              : position.aspect === "4:3"
                ? "relative aspect-[4/3] overflow-hidden rounded-xl"
                : "relative aspect-video overflow-hidden rounded-xl"
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Zuschnitt-Vorschau"
            className="h-full w-full object-cover"
            src={imageUrl}
            style={{
              objectPosition: `${position.x}% ${position.y}%`,
              transform: `scale(${position.zoom / 100})`,
            }}
          />
        </div>
        <select
          className="w-full rounded-lg border p-2 text-sm"
          name="cropAspect"
          onChange={(e) =>
            setPosition({ ...position, aspect: e.currentTarget.value })
          }
          value={position.aspect}
        >
          <option value="original">Original</option>
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="1:1">Quadratisch</option>
        </select>
        {[
          ["cropX", "Horizontal", "x"],
          ["cropY", "Vertikal", "y"],
          ["cropZoom", "Zoom", "zoom"],
        ].map(([name, label, key]) => (
          <label className="block text-xs font-semibold" key={name}>
            {label}
            <input
              className="block w-full"
              max={key === "zoom" ? 200 : 100}
              min={key === "zoom" ? 100 : 0}
              name={name}
              onChange={(e) =>
                setPosition({
                  ...position,
                  [key]: Number(e.currentTarget.value),
                })
              }
              type="range"
              value={position[key as "x" | "y" | "zoom"]}
            />
          </label>
        ))}
        <button className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white">
          WebP neu erzeugen
        </button>
      </form>
    </details>
  );
}

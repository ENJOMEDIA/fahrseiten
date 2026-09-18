import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface MediaStorage {
  write(key: string, bytes: Uint8Array): Promise<void>;
  read(key: string): Promise<Uint8Array>;
  delete(key: string): Promise<void>;
}

export class LocalMediaStorage implements MediaStorage {
  constructor(private readonly root: string) {}
  async write(key: string, bytes: Uint8Array) {
    const target = this.resolve(key);
    await mkdir(path.dirname(target), { recursive: true, mode: 0o750 });
    const temporary = `${target}.uploading`;
    await writeFile(temporary, bytes, { mode: 0o640 });
    await rename(temporary, target);
  }
  async read(key: string) {
    return new Uint8Array(await readFile(this.resolve(key)));
  }
  async delete(key: string) {
    try {
      await unlink(this.resolve(key));
    } catch (error) {
      if (
        !error ||
        typeof error !== "object" ||
        !("code" in error) ||
        error.code !== "ENOENT"
      )
        throw error;
    }
  }
  private resolve(key: string) {
    if (!/^[a-zA-Z0-9/_-]+\.(png|jpg|webp|svg|ico|pdf)$/.test(key))
      throw new Error("Ungültiger Speicherschlüssel.");
    const target = path.resolve(this.root, key);
    const root = `${path.resolve(this.root)}${path.sep}`;
    if (!target.startsWith(root))
      throw new Error("Speicherpfad außerhalb des Medienbereichs.");
    return target;
  }
}

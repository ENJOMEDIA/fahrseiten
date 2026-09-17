import { randomBytes, scrypt as nodeScrypt } from "node:crypto";

const KEY_LENGTH = 64;
const COST = 32_768;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    nodeScrypt(
      password.normalize("NFKC"),
      salt,
      KEY_LENGTH,
      {
        N: COST,
        r: BLOCK_SIZE,
        p: PARALLELIZATION,
        maxmem: 64 * 1024 * 1024,
      },
      (error, derivedKey) => (error ? reject(error) : resolve(derivedKey)),
    );
  });
}

export async function hashInstallerPassword(password) {
  if (password.length < 12 || password.length > 200) {
    throw new Error(
      "Das Eigentümerpasswort muss 12 bis 200 Zeichen lang sein.",
    );
  }

  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt);
  return [
    "scrypt",
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

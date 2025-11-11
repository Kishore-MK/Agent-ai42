import bs58 from "bs58";
import nacl from "tweetnacl";
import { SignatureData } from "../types.js";

export function parseUrlComponents(url: string): {
  authority: string;
  path: string;
  baseUrl:string;
} {
  try {
    const urlObj = new URL(url);
    const authority = urlObj.host;
    let baseUrl= `http://${urlObj.hostname}:${urlObj.port}`
    let path = urlObj.pathname;
    if (urlObj.search) {
      path += urlObj.search;
    }
    return { authority, path, baseUrl };
  } catch (e) {
    console.error("❌ Error parsing URL:", e);
    return { authority: "", path: "",baseUrl:"" };
  }
}

export function createEd25519Signature(
  authority: string,
  path: string,
  keyid: string,
  nonce: string,
  created: number,
  expires: number,
  tag: string,
  privateKeyBase58: string,
  publicKeyBase58: string
): { signatureInput: string; signature: string } {
  console.log("🔐 Creating Ed25519 signature with Base58 encoding...");
  console.log("🌐 Authority:", authority);
  console.log("📍 Path:", path);

  // Create signature parameters string
  const signatureParams = `("@authority" "@path"); created=${created}; expires=${expires}; keyId="${keyid}"; alg="ed25519"; nonce="${nonce}"; tag="${tag}"`;

  // Create the signature base string
  const signatureBaseLines = [
    `"@authority": ${authority}`,
    `"@path": ${path}`,
    `"@signature-params": ${signatureParams}`,
  ];
  const signatureBase = signatureBaseLines.join("\n");

  console.log("🔐 Ed25519 Signature Base String:");
  console.log("---BEGIN---");
  console.log(signatureBase);
  console.log("---END---");

  // Decode Base58 private key (64 bytes for TweetNaCl)
  const privateKeyBuffer = bs58.decode(privateKeyBase58);
  console.log("🔑 Private Key Length:", privateKeyBuffer.length, "bytes");

  if (privateKeyBuffer.length !== 64) {
    throw new Error(
      `Ed25519 private key must be 64 bytes for TweetNaCl, got ${privateKeyBuffer.length}`
    );
  }

  console.log(
    "🔑 Using Ed25519 Private Key (Base58):",
    privateKeyBase58.substring(0, 20) + "..."
  );
  console.log(
    "🔑 Using Ed25519 Public Key (Base58):",
    publicKeyBase58.substring(0, 20) + "..."
  );

  // Sign with Ed25519
  const messageBytes = new TextEncoder().encode(signatureBase);
  const signatureBuffer = nacl.sign.detached(messageBytes, privateKeyBuffer);

  // Encode signature to Base58
  const signatureBase58 = bs58.encode(signatureBuffer);
  console.log("✍️  Base Signature:", signatureBase58.length);

  // Format headers
  const signatureInputHeader = `sig2=("@authority" "@path"); created=${created}; expires=${expires}; keyId="${keyid}"; alg="ed25519"; nonce="${nonce}"; tag="${tag}"`;
  const signatureHeader = `sig2=:${signatureBase58}:`;

  console.log("✅ Created Ed25519 signature (Base58)");
  console.log("📤 Signature-Input:", signatureInputHeader);
  console.log("🔒 Signature:", signatureHeader);

  return {
    signatureInput: signatureInputHeader,
    signature: signatureHeader,
  };
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

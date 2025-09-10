// AES-GCM simple util (clave debe ser 16/24/32 chars)
export async function encryptPassword(plain: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const rawKey = enc.encode(key);
  const cryptoKey = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt']);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(plain));
  // concatenar iv + cipher
  const merged = new Uint8Array(iv.length + cipherBuffer.byteLength);
  merged.set(iv, 0);
  merged.set(new Uint8Array(cipherBuffer), iv.length);
  return btoa(String.fromCharCode(...merged));
}

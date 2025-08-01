export async function hashProjectId(name) {
  const encoder = new TextEncoder();
  const data = encoder.encode(name + Date.now());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 12); // Return first 12 characters for brevity
}

export function encodeCVV(cvv: string): string {
  return btoa(cvv);
}

export function decodeCVV(base64: string): string {
  return atob(base64);
}
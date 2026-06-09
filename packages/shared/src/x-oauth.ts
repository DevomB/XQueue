export function tokenExpiresAt(expiresInSeconds: number): Date {
  return new Date(Date.now() + expiresInSeconds * 1000);
}

export function needsTokenRefresh(expiresAt: Date, bufferMinutes = 5): boolean {
  return expiresAt.getTime() <= Date.now() + bufferMinutes * 60 * 1000;
}

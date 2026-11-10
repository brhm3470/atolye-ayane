export function normalizeInstagramUsername(username: string): string {
  return username.replace(/^@/, '').trim().toLowerCase();
}

export function formatTL(cents: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

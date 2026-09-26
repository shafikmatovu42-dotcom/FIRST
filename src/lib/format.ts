export function formatUgx(amount: number): string {
  return `UGX ${Math.round(amount).toLocaleString("en-US")}`;
}

export function orderRef(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `TH-${n}`;
}

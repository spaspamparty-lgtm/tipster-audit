/** Peak-to-trough decline in sampled cumulative profit, in stake units.
 * This is not a full-history drawdown without an event-level ledger. */
export function sampledDrawdown(series: readonly number[]): number {
  let peak = 0, decline = 0;
  for (const value of series) {
    peak = Math.max(peak, value);
    decline = Math.max(decline, peak - value);
  }
  return decline;
}
export function costScenario(profitUnits: number, stake: number, monthlyFee: number) {
  if (![profitUnits, stake, monthlyFee].every(Number.isFinite) || stake <= 0 || monthlyFee < 0) return null;
  const gross = profitUnits * stake;
  return { gross, fee: monthlyFee, net: gross - monthlyFee, breakEvenStake: profitUnits > 0 ? monthlyFee / profitUnits : null };
}

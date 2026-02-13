type StatChipProps = {
  value: number;
  label?: string;
  decimals?: number;
};

export default function StatChip({ value, label, decimals = 2 }: StatChipProps) {
  const sign = value >= 0 ? "+" : "";
  const formatted = `${sign}${value.toFixed(decimals)}`;
  const className = value > 0 ? "stat-chip positive" : value < 0 ? "stat-chip negative" : "stat-chip";

  return (
    <span className={className}>
      {label && <span>{label}</span>}
      <span>{formatted}</span>
    </span>
  );
}

// 숫자를 B, M, K 단위로 바꿔주는 함수
export function formatNumberToAbbreviation(num: number): string {
  if (num >= 1_000_000_000) return `${Math.floor(num / 1_000_000_000)}B`;
  if (num >= 1_000_000) return `${Math.floor(num / 1_000_000)}M`;
  if (num >= 1_000) return `${Math.floor(num / 1_000)}K`;
  return num.toString();
}

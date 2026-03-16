export function getResolutionDuration(
  createdAt: Date,
  finishedAt?: Date | null,
): string | null {
  if (!finishedAt) return null;

  const start = new Date(createdAt);
  const end = finishedAt ? finishedAt : new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return null;

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  return `${hh}:${mm}`;
}

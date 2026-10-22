export function formatPublishedAt(publishedAt: string): string {
  // Preserve the API's Chilean wall-clock time, including its seasonal offset.
  const localDate = new Date(publishedAt.replace(/(?:Z|[+-]\d{2}:\d{2})$/, 'Z'))

  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC'
  }).format(localDate)
}

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replaceAll('"', '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

export type CsvColumn<T> = Readonly<{
  header: string;
  value: (row: T) => unknown;
}>;

export const toCsvBuffer = <T>(
  columns: CsvColumn<T>[],
  rows: Iterable<T>,
): Buffer => {
  const lines: string[] = [];
  lines.push(columns.map((c) => escapeCsvValue(c.header)).join(','));

  for (const row of rows) {
    lines.push(
      columns.map((c) => escapeCsvValue(c.value(row))).join(','),
    );
  }

  const csv = lines.join('\n') + '\n';
  // UTF-8 com BOM ajuda Excel/PT-BR a abrir acentos corretamente
  return Buffer.from(`\uFEFF${csv}`, 'utf8');
};


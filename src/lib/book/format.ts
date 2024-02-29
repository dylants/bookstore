import { Format } from '@prisma/client';

export function formatToDisplayString(format: Format): string {
  switch (format) {
    case Format.HARDCOVER:
      return 'Hardcover';
    case Format.MASS_MARKET:
      return 'Mass Market Paperback';
    case Format.TRADE_PAPERBACK:
      return 'Trade Paperback';
    default:
      return '';
  }
}

const formatKeys = Object.keys(Format) as Format[];
export function stringToFormat(formatAsString: string): Format {
  const format = formatKeys.find((fk) => fk.toString() === formatAsString);
  if (format) {
    return format;
  }

  throw new Error('unsupported format: ' + formatAsString);
}

export const FORMAT_OPTIONS = formatKeys.map((format) => ({
  label: formatToDisplayString(format),
  value: format,
}));

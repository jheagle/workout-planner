/**
 * A date as 'YYYY-MM-DD' in the machine's own timezone - the shape every workout's date uses. Not
 * toISOString().slice(0, 10): that's the UTC date, which is already tomorrow in the evening anywhere
 * west of UTC (21:30 in Toronto is 01:30 UTC).
 * @param date - defaults to now
 */
export const localDate = (date = new Date()) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0')
].join('-')

export function monthFormatter(date: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) {
    throw new Error("Month format should be YYYY-MM");
  }

  const [yearStr, monthStr] = date.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`,
  };
}

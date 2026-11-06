export function monthFormatter(date: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(date)) {
    throw new Error("Month format should be YYYY-MM")
  }

  const [year, month] = date.split("-")

  const nextYear = parseInt(month) === 12 ? year + 1 : year
  const nextMonth = parseInt(month) === 12 ? 1 : month + 1

  return {
    start: `${year}-${month.padStart(2, "0")}-01`,
    end: `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`
  }

}
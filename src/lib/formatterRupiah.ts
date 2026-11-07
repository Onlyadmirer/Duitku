export const formatRupiah = (value: string) => {
  const number = value.replace(/\D/g, "");

  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseRupiah = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
};

export const formatCompactRupiah = (amount: number): string => {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const sign = isNegative ? "-" : "";

  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000)
      .toFixed(1)
      .replace(/\.0$/, "")
      .replace(".", ",");
    return `${sign}Rp ${val} M`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000)
      .toFixed(1)
      .replace(/\.0$/, "")
      .replace(".", ",");
    return `${sign}Rp ${val} jt`;
  }
  if (abs >= 1_000) {
    const val = Math.round(abs / 1_000);
    return `${sign}Rp ${val} rb`;
  }
  return `${sign}Rp ${abs}`;
};

export const formatShortThousand = (amount: number): string => {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000)
      .toFixed(1)
      .replace(/\.0$/, "")
      .replace(".", ",");
    return `Rp ${val}jt`;
  }
  if (abs >= 1_000) {
    return `Rp ${Math.floor(abs / 1_000)}k`;
  }
  return `Rp ${abs}`;
};

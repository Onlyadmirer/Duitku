export const formatRupiah = (value: string) => {
  const number = value.replace(/\D/g, "");

  return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseRupiah = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
};
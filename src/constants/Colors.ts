export const Colors = {
  light: {
    background: "#F4F5F7",    // Abu-abu sangat muda untuk latar layar utama
    card: "#FFFFFF",          // Putih bersih untuk kontainer/bento card
    cardDark: "#111111",      // Hitam pekat untuk banner, kartu sekunder & tab bar melayang
    text: "#111111",          // Hitam pekat untuk teks & angka utama
    textMuted: "#8E8E93",     // Abu-abu medium untuk label/subtitle
    primary: "#B4F000",       // Electric Lime Green untuk kartu utama, highlight & progress bar
    tabBackground: "#111111", // Kapsul navigasi bawah selalu hitam pekat
    tabActive: "#B4F000",     // Ikon tab aktif menggunakan hijau lime (atau "#FFFFFF")
    tabInActive: "#71717A",   // Ikon tab tidak aktif
    success: "#16A34A",       // Hijau untuk teks nominal pemasukan (+Rp) & status aman
    danger: "#EA580C",        // Merah-oranye (Coral) untuk pengeluaran (-Rp) & over-budget

    backgroundCardModal: "#FFFFFF",
    toggleType: "#111111",
    textType: "#FAFAFA",
    backgroundInput: "#F3F4F6",
    border: "#dcdcdc",

    borderQuickAmount: "#F4F5F7"
  },
  dark: {
    background: "#0A0A0A",    // Hitam latar belakang utama
    card: "#161618",          // Abu-abu gelap untuk bento card
    cardDark: "#222225",      // Kontainer sekunder
    text: "#FAFAFA",          // Putih untuk teks utama
    textMuted: "#8E8E93",     // Abu-abu untuk subtitle
    primary: "#B4F000",       // Electric Lime tetap menyala di mode gelap
    tabBackground: "#1C1C1E", // Kapsul navigasi bawah di mode gelap
    tabActive: "#B4F000",
    tabInActive: "#71717A",
    success: "#22C55E",
    danger: "#F97316",
    border: "#252B38",
    backgroundCardModal: "#0C1424",
    toggleType: "#B4F000",
    textType: "#111111",
    backgroundInput: "#182235",

    borderQuickAmount: "#515050"
  },
} as const;
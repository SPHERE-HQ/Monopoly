import { CardDeck } from "./types";

export const CHANCE_CARDS: CardDeck[] = [
  { id: 1, type: "chance", text: "Maju ke GO! Ambil M200", action: { type: "move", to: 0 } },
  { id: 2, type: "chance", text: "Maju ke Illinois Avenue", action: { type: "move", to: 24 } },
  { id: 3, type: "chance", text: "Maju ke St. Charles Place", action: { type: "move", to: 11 } },
  { id: 4, type: "chance", text: "Maju ke stasiun terdekat", action: { type: "move-to-nearest-railroad" } },
  { id: 5, type: "chance", text: "Maju ke utilitas terdekat", action: { type: "move-to-nearest-utility" } },
  { id: 6, type: "chance", text: "Bank membayar dividen M50", action: { type: "money", amount: 50 } },
  { id: 7, type: "chance", text: "Kartu Bebas Penjara! Simpan kartu ini.", action: { type: "get-out-of-jail" } },
  { id: 8, type: "chance", text: "Mundur 3 langkah", action: { type: "move-relative", amount: -3 } },
  { id: 9, type: "chance", text: "Masuk penjara! Langsung ke penjara.", action: { type: "go-to-jail" } },
  { id: 10, type: "chance", text: "Perbaikan umum: bayar M25 per rumah, M100 per hotel", action: { type: "repairs", house: 25, hotel: 100 } },
  { id: 11, type: "chance", text: "Bayar denda tilang M15", action: { type: "money", amount: -15 } },
  { id: 12, type: "chance", text: "Maju ke Reading Railroad", action: { type: "move", to: 5 } },
  { id: 13, type: "chance", text: "Maju ke Boardwalk", action: { type: "move", to: 39 } },
  { id: 14, type: "chance", text: "Terpilih sebagai Ketua. Bayar tiap pemain M50", action: { type: "money-per-player", amount: -50 } },
  { id: 15, type: "chance", text: "Pinjaman bangunan jatuh tempo. Terima M150", action: { type: "money", amount: 150 } },
  { id: 16, type: "chance", text: "Kemenangan kompetisi kata silang M100", action: { type: "money", amount: 100 } },
];

export const COMMUNITY_CARDS: CardDeck[] = [
  { id: 1, type: "community-chest", text: "Maju ke GO! Ambil M200", action: { type: "move", to: 0 } },
  { id: 2, type: "community-chest", text: "Rekonsiliasi bank demi kamu. Ambil M200", action: { type: "money", amount: 200 } },
  { id: 3, type: "community-chest", text: "Bayar tagihan dokter M50", action: { type: "money", amount: -50 } },
  { id: 4, type: "community-chest", text: "Dari penjualan saham ambil M50", action: { type: "money", amount: 50 } },
  { id: 5, type: "community-chest", text: "Kartu Bebas Penjara! Simpan kartu ini.", action: { type: "get-out-of-jail" } },
  { id: 6, type: "community-chest", text: "Masuk penjara! Langsung ke penjara.", action: { type: "go-to-jail" } },
  { id: 7, type: "community-chest", text: "Hari ulang tahun! Terima M10 dari tiap pemain", action: { type: "money-per-player", amount: 10 } },
  { id: 8, type: "community-chest", text: "Kamu menang kontes kecantikan. Ambil M100", action: { type: "money", amount: 100 } },
  { id: 9, type: "community-chest", text: "Kamu mewarisi M100", action: { type: "money", amount: 100 } },
  { id: 10, type: "community-chest", text: "Terima bunga pinjaman M25", action: { type: "money", amount: 25 } },
  { id: 11, type: "community-chest", text: "Bayar tagihan sekolah M150", action: { type: "money", amount: -150 } },
  { id: 12, type: "community-chest", text: "Pajak penilaian jalan: M40 per rumah, M115 per hotel", action: { type: "repairs", house: 40, hotel: 115 } },
  { id: 13, type: "community-chest", text: "Terima komisi dari penjualan M25", action: { type: "money", amount: 25 } },
  { id: 14, type: "community-chest", text: "Bayar premi asuransi M50", action: { type: "money", amount: -50 } },
  { id: 15, type: "community-chest", text: "Kredit pajak penghasilan. Terima M20", action: { type: "money", amount: 20 } },
  { id: 16, type: "community-chest", text: "Liburan dana liburan! Terima M100", action: { type: "money", amount: 100 } },
];

export function shuffleCards<T>(cards: T[]): T[] {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

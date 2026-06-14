import { Tile } from "./types";

export const BOARD_TILES: Tile[] = [
  // Bottom row (0-9), right to left
  { id: 0,  name: "GO",           shortName: "GO",       type: "go",             group: "corner",    houses: 0, hotel: false, mortgaged: false },
  { id: 1,  name: "Jayapura",     shortName: "Jayapura", type: "property",        group: "brown",     price: 60,  rent: [2,10,30,90,160,250],   houseCost: 50, hotelCost: 50, mortgageValue: 30,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 2,  name: "Kas Umum",     shortName: "Kas",      type: "community-chest", group: "community", houses: 0, hotel: false, mortgaged: false },
  { id: 3,  name: "Sorong",       shortName: "Sorong",   type: "property",        group: "brown",     price: 60,  rent: [4,20,60,180,320,450],  houseCost: 50, hotelCost: 50, mortgageValue: 30,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 4,  name: "Pajak Pendapatan", shortName: "Pajak", type: "income-tax",   group: "tax",       taxAmount: 200, houses: 0, hotel: false, mortgaged: false },
  { id: 5,  name: "Bandara Soekarno-Hatta", shortName: "CGK",type: "railroad",  group: "railroad",  price: 200, railroadRent: [25,50,100,200], mortgageValue: 100, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 6,  name: "Ambon",        shortName: "Ambon",    type: "property",        group: "light-blue",price: 100, rent: [6,30,90,270,400,550],  houseCost: 50, hotelCost: 50, mortgageValue: 50,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 7,  name: "Kesempatan",   shortName: "?",        type: "chance",          group: "chance",    houses: 0, hotel: false, mortgaged: false },
  { id: 8,  name: "Kupang",       shortName: "Kupang",   type: "property",        group: "light-blue",price: 100, rent: [6,30,90,270,400,550],  houseCost: 50, hotelCost: 50, mortgageValue: 50,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 9,  name: "Manado",       shortName: "Manado",   type: "property",        group: "light-blue",price: 120, rent: [8,40,100,300,450,600], houseCost: 50, hotelCost: 50, mortgageValue: 60,  houses: 0, hotel: false, mortgaged: false, ownerId: null },

  // Left column (10-19), bottom to top
  { id: 10, name: "Penjara",      shortName: "Penjara",  type: "jail",            group: "corner",    houses: 0, hotel: false, mortgaged: false },
  { id: 11, name: "Palembang",    shortName: "Plmbang",  type: "property",        group: "pink",      price: 140, rent: [10,50,150,450,625,750],houseCost: 100,hotelCost: 100,mortgageValue: 70,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 12, name: "PLN",          shortName: "PLN",      type: "utility",         group: "utility",   price: 150, utilityMultiplier: [4,10], mortgageValue: 75, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 13, name: "Pontianak",    shortName: "Pntnak",   type: "property",        group: "pink",      price: 140, rent: [10,50,150,450,625,750],houseCost: 100,hotelCost: 100,mortgageValue: 70,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 14, name: "Banjarmasin",  shortName: "Bnjrmsin", type: "property",        group: "pink",      price: 160, rent: [12,60,180,500,700,900],houseCost: 100,hotelCost: 100,mortgageValue: 80,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 15, name: "Bandara Juanda",shortName: "SUB",     type: "railroad",        group: "railroad",  price: 200, railroadRent: [25,50,100,200], mortgageValue: 100, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 16, name: "Semarang",     shortName: "Smrang",   type: "property",        group: "orange",    price: 180, rent: [14,70,200,550,750,950],houseCost: 100,hotelCost: 100,mortgageValue: 90,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 17, name: "Kas Umum",     shortName: "Kas",      type: "community-chest", group: "community", houses: 0, hotel: false, mortgaged: false },
  { id: 18, name: "Yogyakarta",   shortName: "Yogya",    type: "property",        group: "orange",    price: 180, rent: [14,70,200,550,750,950],houseCost: 100,hotelCost: 100,mortgageValue: 90,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 19, name: "Solo",         shortName: "Solo",     type: "property",        group: "orange",    price: 200, rent: [16,80,220,600,800,1000],houseCost:100,hotelCost: 100,mortgageValue: 100, houses: 0, hotel: false, mortgaged: false, ownerId: null },

  // Top row (20-29), left to right
  { id: 20, name: "Parkir Gratis",shortName: "Parkir",   type: "free-parking",    group: "corner",    houses: 0, hotel: false, mortgaged: false },
  { id: 21, name: "Padang",       shortName: "Padang",   type: "property",        group: "red",       price: 220, rent: [18,90,250,700,875,1050],houseCost:150,hotelCost: 150,mortgageValue: 110, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 22, name: "Kesempatan",   shortName: "?",        type: "chance",          group: "chance",    houses: 0, hotel: false, mortgaged: false },
  { id: 23, name: "Pekanbaru",    shortName: "PKU",      type: "property",        group: "red",       price: 220, rent: [18,90,250,700,875,1050],houseCost:150,hotelCost: 150,mortgageValue: 110, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 24, name: "Medan",        shortName: "Medan",    type: "property",        group: "red",       price: 240, rent: [20,100,300,750,925,1100],houseCost:150,hotelCost:150,mortgageValue: 120, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 25, name: "Bandara Ngurah Rai",shortName: "DPS", type: "railroad",        group: "railroad",  price: 200, railroadRent: [25,50,100,200], mortgageValue: 100, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 26, name: "Bandung",      shortName: "Bandung",  type: "property",        group: "yellow",    price: 260, rent: [22,110,330,800,975,1150],houseCost:150,hotelCost:150,mortgageValue: 130, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 27, name: "Bogor",        shortName: "Bogor",    type: "property",        group: "yellow",    price: 260, rent: [22,110,330,800,975,1150],houseCost:150,hotelCost:150,mortgageValue: 130, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 28, name: "PDAM",         shortName: "PDAM",     type: "utility",         group: "utility",   price: 150, utilityMultiplier: [4,10], mortgageValue: 75, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 29, name: "Depok",        shortName: "Depok",    type: "property",        group: "yellow",    price: 280, rent: [24,120,360,850,1025,1200],houseCost:150,hotelCost:150,mortgageValue: 140, houses: 0, hotel: false, mortgaged: false, ownerId: null },

  // Right column (30-39), top to bottom
  { id: 30, name: "Ke Penjara!",  shortName: "Penjara!", type: "go-to-jail",      group: "corner",    houses: 0, hotel: false, mortgaged: false },
  { id: 31, name: "Jakarta Timur",shortName: "Jak.Tim",  type: "property",        group: "green",     price: 300, rent: [26,130,390,900,1100,1275],houseCost:200,hotelCost:200,mortgageValue: 150, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 32, name: "Jakarta Barat",shortName: "Jak.Bar",  type: "property",        group: "green",     price: 300, rent: [26,130,390,900,1100,1275],houseCost:200,hotelCost:200,mortgageValue: 150, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 33, name: "Kas Umum",     shortName: "Kas",      type: "community-chest", group: "community", houses: 0, hotel: false, mortgaged: false },
  { id: 34, name: "Jakarta Selatan",shortName:"Jak.Sel", type: "property",        group: "green",     price: 320, rent: [28,150,450,1000,1200,1400],houseCost:200,hotelCost:200,mortgageValue: 160, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 35, name: "Bandara Sultan Hasanuddin",shortName:"UPG",type:"railroad",    group: "railroad",  price: 200, railroadRent: [25,50,100,200], mortgageValue: 100, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 36, name: "Kesempatan",   shortName: "?",        type: "chance",          group: "chance",    houses: 0, hotel: false, mortgaged: false },
  { id: 37, name: "Jakarta Pusat",shortName: "Jak.Pst",  type: "property",        group: "dark-blue", price: 350, rent: [35,175,500,1100,1300,1500],houseCost:200,hotelCost:200,mortgageValue: 175, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 38, name: "Pajak Mewah",  shortName: "Pajak",    type: "luxury-tax",      group: "tax",       taxAmount: 100, houses: 0, hotel: false, mortgaged: false },
  { id: 39, name: "Bali",         shortName: "Bali",     type: "property",        group: "dark-blue", price: 400, rent: [50,200,600,1400,1700,2000],houseCost:200,hotelCost:200,mortgageValue: 200, houses: 0, hotel: false, mortgaged: false, ownerId: null },
];

export const GROUP_COLORS: Record<string, string> = {
  "brown":     "#c0642a",
  "light-blue":"#29b6f6",
  "pink":      "#f06292",
  "orange":    "#fb8c00",
  "red":       "#e53935",
  "yellow":    "#fdd835",
  "green":     "#43a047",
  "dark-blue": "#1565c0",
  "railroad":  "#546e7a",
  "utility":   "#78909c",
  "tax":       "#ef9a9a",
  "corner":    "#fffde7",
  "chance":    "#ff8f00",
  "community": "#00acc1",
};

export const PLAYER_COLORS: Record<string, string> = {
  red:    "#ef4444",
  blue:   "#3b82f6",
  green:  "#22c55e",
  yellow: "#eab308",
};

export function getTilePosition(tileId: number): [number, number, number] {
  const BOARD_SIZE = 10;
  const TILE_SIZE = 1.1;
  const HALF = (BOARD_SIZE / 2) * TILE_SIZE;

  if (tileId <= 10) {
    const x = HALF - tileId * TILE_SIZE;
    return [x, 0.05, HALF];
  } else if (tileId <= 20) {
    const z = HALF - (tileId - 10) * TILE_SIZE;
    return [-HALF, 0.05, z];
  } else if (tileId <= 30) {
    const x = -HALF + (tileId - 20) * TILE_SIZE;
    return [x, 0.05, -HALF];
  } else {
    const z = -HALF + (tileId - 30) * TILE_SIZE;
    return [HALF, 0.05, z];
  }
}

export function getTileTextRotation(tileId: number): number {
  if (tileId <= 10) return 0;
  if (tileId <= 20) return Math.PI / 2;
  if (tileId <= 30) return Math.PI;
  return -Math.PI / 2;
}

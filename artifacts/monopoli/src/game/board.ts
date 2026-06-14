import { Tile } from "./types";

export const BOARD_TILES: Tile[] = [
  // Bottom row (0-9), right to left
  { id: 0,  name: "GO",             type: "go",             group: "corner",    houses: 0, hotel: false, mortgaged: false },
  { id: 1,  name: "Mediterranean",  type: "property",        group: "brown",     price: 60,  rent: [2,10,30,90,160,250],  houseCost: 50, hotelCost: 50, mortgageValue: 30,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 2,  name: "Community Chest",type: "community-chest", group: "community", houses: 0, hotel: false, mortgaged: false },
  { id: 3,  name: "Baltic Ave",     type: "property",        group: "brown",     price: 60,  rent: [4,20,60,180,320,450], houseCost: 50, hotelCost: 50, mortgageValue: 30,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 4,  name: "Income Tax",     type: "income-tax",      group: "tax",       taxAmount: 200, houses: 0, hotel: false, mortgaged: false },
  { id: 5,  name: "Reading RR",     type: "railroad",        group: "railroad",  price: 200, railroadRent: [25,50,100,200], mortgageValue: 100, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 6,  name: "Oriental Ave",   type: "property",        group: "light-blue",price: 100, rent: [6,30,90,270,400,550], houseCost: 50, hotelCost: 50, mortgageValue: 50,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 7,  name: "Chance",         type: "chance",          group: "chance",    houses: 0, hotel: false, mortgaged: false },
  { id: 8,  name: "Vermont Ave",    type: "property",        group: "light-blue",price: 100, rent: [6,30,90,270,400,550], houseCost: 50, hotelCost: 50, mortgageValue: 50,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 9,  name: "Connecticut Ave",type: "property",        group: "light-blue",price: 120, rent: [8,40,100,300,450,600],houseCost: 50, hotelCost: 50, mortgageValue: 60,  houses: 0, hotel: false, mortgaged: false, ownerId: null },

  // Left column (10-19), bottom to top
  { id: 10, name: "Penjara",        type: "jail",            group: "corner",    houses: 0, hotel: false, mortgaged: false },
  { id: 11, name: "St. Charles Pl", type: "property",        group: "pink",      price: 140, rent: [10,50,150,450,625,750],houseCost: 100,hotelCost: 100,mortgageValue: 70,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 12, name: "Electric Co",    type: "utility",         group: "utility",   price: 150, utilityMultiplier: [4,10], mortgageValue: 75, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 13, name: "States Ave",     type: "property",        group: "pink",      price: 140, rent: [10,50,150,450,625,750],houseCost: 100,hotelCost: 100,mortgageValue: 70,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 14, name: "Virginia Ave",   type: "property",        group: "pink",      price: 160, rent: [12,60,180,500,700,900],houseCost: 100,hotelCost: 100,mortgageValue: 80,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 15, name: "Pennsylvania RR",type: "railroad",        group: "railroad",  price: 200, railroadRent: [25,50,100,200], mortgageValue: 100, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 16, name: "St. James Pl",   type: "property",        group: "orange",    price: 180, rent: [14,70,200,550,750,950],houseCost: 100,hotelCost: 100,mortgageValue: 90,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 17, name: "Community Chest",type: "community-chest", group: "community", houses: 0, hotel: false, mortgaged: false },
  { id: 18, name: "Tennessee Ave",  type: "property",        group: "orange",    price: 180, rent: [14,70,200,550,750,950],houseCost: 100,hotelCost: 100,mortgageValue: 90,  houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 19, name: "New York Ave",   type: "property",        group: "orange",    price: 200, rent: [16,80,220,600,800,1000],houseCost:100,hotelCost: 100,mortgageValue: 100, houses: 0, hotel: false, mortgaged: false, ownerId: null },

  // Top row (20-29), left to right
  { id: 20, name: "Parkir Gratis",  type: "free-parking",    group: "corner",    houses: 0, hotel: false, mortgaged: false },
  { id: 21, name: "Kentucky Ave",   type: "property",        group: "red",       price: 220, rent: [18,90,250,700,875,1050],houseCost:150,hotelCost: 150,mortgageValue: 110, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 22, name: "Chance",         type: "chance",          group: "chance",    houses: 0, hotel: false, mortgaged: false },
  { id: 23, name: "Indiana Ave",    type: "property",        group: "red",       price: 220, rent: [18,90,250,700,875,1050],houseCost:150,hotelCost: 150,mortgageValue: 110, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 24, name: "Illinois Ave",   type: "property",        group: "red",       price: 240, rent: [20,100,300,750,925,1100],houseCost:150,hotelCost:150,mortgageValue: 120, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 25, name: "B&O Railroad",   type: "railroad",        group: "railroad",  price: 200, railroadRent: [25,50,100,200], mortgageValue: 100, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 26, name: "Atlantic Ave",   type: "property",        group: "yellow",    price: 260, rent: [22,110,330,800,975,1150],houseCost:150,hotelCost:150,mortgageValue: 130, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 27, name: "Ventnor Ave",    type: "property",        group: "yellow",    price: 260, rent: [22,110,330,800,975,1150],houseCost:150,hotelCost:150,mortgageValue: 130, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 28, name: "Water Works",    type: "utility",         group: "utility",   price: 150, utilityMultiplier: [4,10], mortgageValue: 75, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 29, name: "Marvin Gardens", type: "property",        group: "yellow",    price: 280, rent: [24,120,360,850,1025,1200],houseCost:150,hotelCost:150,mortgageValue: 140, houses: 0, hotel: false, mortgaged: false, ownerId: null },

  // Right column (30-39), top to bottom
  { id: 30, name: "Ke Penjara!",    type: "go-to-jail",      group: "corner",    houses: 0, hotel: false, mortgaged: false },
  { id: 31, name: "Pacific Ave",    type: "property",        group: "green",     price: 300, rent: [26,130,390,900,1100,1275],houseCost:200,hotelCost:200,mortgageValue: 150, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 32, name: "N. Carolina Ave",type: "property",        group: "green",     price: 300, rent: [26,130,390,900,1100,1275],houseCost:200,hotelCost:200,mortgageValue: 150, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 33, name: "Community Chest",type: "community-chest", group: "community", houses: 0, hotel: false, mortgaged: false },
  { id: 34, name: "Pennsylvania Ave",type:"property",        group: "green",     price: 320, rent: [28,150,450,1000,1200,1400],houseCost:200,hotelCost:200,mortgageValue: 160, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 35, name: "Short Line RR",  type: "railroad",        group: "railroad",  price: 200, railroadRent: [25,50,100,200], mortgageValue: 100, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 36, name: "Chance",         type: "chance",          group: "chance",    houses: 0, hotel: false, mortgaged: false },
  { id: 37, name: "Park Place",     type: "property",        group: "dark-blue", price: 350, rent: [35,175,500,1100,1300,1500],houseCost:200,hotelCost:200,mortgageValue: 175, houses: 0, hotel: false, mortgaged: false, ownerId: null },
  { id: 38, name: "Luxury Tax",     type: "luxury-tax",      group: "tax",       taxAmount: 100, houses: 0, hotel: false, mortgaged: false },
  { id: 39, name: "Boardwalk",      type: "property",        group: "dark-blue", price: 400, rent: [50,200,600,1400,1700,2000],houseCost:200,hotelCost:200,mortgageValue: 200, houses: 0, hotel: false, mortgaged: false, ownerId: null },
];

export const GROUP_COLORS: Record<string, string> = {
  "brown":     "#8B4513",
  "light-blue":"#87CEEB",
  "pink":      "#FF69B4",
  "orange":    "#FFA500",
  "red":       "#FF0000",
  "yellow":    "#FFD700",
  "green":     "#228B22",
  "dark-blue": "#00008B",
  "railroad":  "#333333",
  "utility":   "#888888",
  "tax":       "#555555",
  "corner":    "#1a1a2e",
  "chance":    "#FF6B35",
  "community": "#4ECDC4",
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
    // Bottom row: 0 (right) to 10 (left)
    const x = HALF - tileId * TILE_SIZE;
    return [x, 0.05, HALF];
  } else if (tileId <= 20) {
    // Left column: 10 (bottom) to 20 (top)
    const z = HALF - (tileId - 10) * TILE_SIZE;
    return [-HALF, 0.05, z];
  } else if (tileId <= 30) {
    // Top row: 20 (left) to 30 (right)
    const x = -HALF + (tileId - 20) * TILE_SIZE;
    return [x, 0.05, -HALF];
  } else {
    // Right column: 30 (top) to 39 (bottom)
    const z = -HALF + (tileId - 30) * TILE_SIZE;
    return [HALF, 0.05, z];
  }
}

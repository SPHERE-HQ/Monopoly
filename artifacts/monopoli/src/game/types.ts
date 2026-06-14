export type PlayerColor = "red" | "blue" | "green" | "yellow";

export type PropertyGroup =
  | "brown" | "light-blue" | "pink" | "orange"
  | "red" | "yellow" | "green" | "dark-blue"
  | "railroad" | "utility" | "tax" | "corner" | "chance" | "community";

export type TileType =
  | "property" | "railroad" | "utility"
  | "go" | "jail" | "free-parking" | "go-to-jail"
  | "chance" | "community-chest"
  | "income-tax" | "luxury-tax";

export interface Tile {
  id: number;
  name: string;
  shortName?: string;
  type: TileType;
  group: PropertyGroup;
  price?: number;
  rent?: number[];
  houseCost?: number;
  hotelCost?: number;
  railroadRent?: number[];
  utilityMultiplier?: number[];
  taxAmount?: number;
  mortgageValue?: number;
  ownerId?: number | null;
  houses: number;
  hotel: boolean;
  mortgaged: boolean;
}

export interface Player {
  id: number;
  name: string;
  color: PlayerColor;
  money: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  getOutOfJailCards: number;
  properties: number[];
  bankrupt: boolean;
  isActive: boolean;
}

export type GamePhase =
  | "setup"
  | "rolling"
  | "moving"
  | "landed"
  | "buying"
  | "paying-rent"
  | "chance"
  | "community-chest"
  | "income-tax"
  | "luxury-tax"
  | "jail"
  | "building"
  | "game-over";

export interface CardDeck {
  id: number;
  type: "chance" | "community-chest";
  text: string;
  action: CardAction;
}

export type CardAction =
  | { type: "move"; to: number }
  | { type: "move-relative"; amount: number }
  | { type: "money"; amount: number }
  | { type: "money-per-player"; amount: number }
  | { type: "get-out-of-jail" }
  | { type: "go-to-jail" }
  | { type: "repairs"; house: number; hotel: number }
  | { type: "move-to-nearest-railroad" }
  | { type: "move-to-nearest-utility" };

export interface GameState {
  players: Player[];
  tiles: Tile[];
  currentPlayerIndex: number;
  phase: GamePhase;
  dice: [number, number];
  lastRoll: [number, number] | null;
  doublesCount: number;
  message: string;
  winner: Player | null;
  chanceCards: CardDeck[];
  communityCards: CardDeck[];
  currentCard: CardDeck | null;
  pendingRent: { amount: number; ownerId: number } | null;
  log: string[];
}

export interface DiceRoll {
  d1: number;
  d2: number;
  isDouble: boolean;
}

export enum Strength {
  NO_CAFFEINE = "No caffeine",
  LIGHT = "Light",
  MEDIUM = "Medium",
  STRONG = "Strong",
}

export enum CoffeeType {
  ESPRESSO = "Espresso",
  CAPPUCCINO = "Cappuccino",
  LATTE_MACHIATO = "Latte Macchiato",
}

export enum Cell {
  TABLE = "table",
  WALL = "wall",
  COFFEE_MACHINE = "caffe_machine",
  NONE = "none",
}

export type EditMode = Cell | "robot";

export enum CoffeeMachineState {
  WAITING = "waiting",
  BREWING = "brewing",
  COFEE_READY = "coffee_ready",
}

export interface CoffeeConfig {
  strength: Strength;
  coffeeType: CoffeeType;
}

export interface Order extends CoffeeConfig {
  tableNr: number[];
}

export type Coordinates = [number, number];

export type Board = Cell[][];

export const coordinatesSchema = {
  type: "array" as const,
  items: {
    type: "number" as const,
  },
  minItems: 2,
  maxItems: 2,
};

export const clientThings: {
  coffeeMachine?: WoT.ConsumedThing;
  robot?: WoT.ConsumedThing;
} = {};

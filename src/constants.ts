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

export enum CellType {
  TABLE = "table",
  WALL = "wall",
  ROBOT = "robot",
  COFFEE_MACHINE = "caffe_machine",
  NONE = "none",
}

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

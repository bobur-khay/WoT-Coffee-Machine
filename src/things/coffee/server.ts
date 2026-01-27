// Required steps to create a servient for creating a thing
import { Servient } from "@node-wot/core";
import { CoapServer } from "@node-wot/binding-coap";
import {
  CoffeeConfig,
  CoffeeMachineState,
  CoffeeType,
  Strength,
} from "../../constants";

class CoffeeMachine {
  constructor(
    public state: CoffeeMachineState,
    public waterLevel: number,
    public beansAmount: number,
    public binLevel: number,
    public progress: number,
    public queue: CoffeeConfig[], // [first order, ..., last order]
  ) {}
}

const servient = new Servient();
servient.addServer(
  new CoapServer({
    port: 8080,
  }),
);

servient.start().then(async (WoT) => {
  console.log("Coffee Machine starting...");
  let errorMessage: string = "";
  try {
    const thing = await WoT.produce(coffeeMachineTd);
    const coffeeMachine = new CoffeeMachine(
      CoffeeMachineState.WAITING,
      10,
      100,
      0,
      0,
      [],
    );

    const order = async (params: any) => {
      const config = await params.value();
      console.log("New order: ", config);
      coffeeMachine.queue.push(config);
      console.log("Queue: ", coffeeMachine.queue);
      // If this is the only order, start brewing directly
      if (coffeeMachine.queue.length === 1) {
        brew();
      }
      return undefined;
    };

    const brew = async () => {
      const order = coffeeMachine.queue[0];
      if (!order) {
        console.log("no order, waiting");
        return undefined;
      }
      if (coffeeMachine.state !== CoffeeMachineState.WAITING) {
        errorMessage = "Coffee machine not ready";
      } else if (coffeeMachine.waterLevel < 10) {
        errorMessage = "Not enough water";
      } else if (coffeeMachine.beansAmount < 10) {
        errorMessage = "Not enough beans";
      } else if (coffeeMachine.binLevel > 90) {
        errorMessage = "Bin is full";
      }
      if (errorMessage) {
        coffeeMachine.progress = 100;
        return undefined;
      }

      console.log("Brewing ", order.coffeeType, order.strength);
      coffeeMachine.state = CoffeeMachineState.BREWING;

      while (
        coffeeMachine.state === CoffeeMachineState.BREWING &&
        coffeeMachine.progress < 100
      ) {
        coffeeMachine.waterLevel -= 1;
        coffeeMachine.beansAmount -= 1;
        coffeeMachine.binLevel += 1;
        coffeeMachine.progress += 10;
        console.log("progress:", coffeeMachine.progress);
        await new Promise((r) => setTimeout(r, 1000));
      }
      coffeeMachine.state = CoffeeMachineState.COFEE_READY;
      console.log(order.coffeeType, order.strength, "ready");
      coffeeMachine.queue.shift();
      console.log("coffee ready, waiting for robot...");
      return undefined;
    };

    thing.setPropertyReadHandler(
      "progress",
      async () => coffeeMachine.progress,
    );
    thing.setPropertyReadHandler("error", async () => errorMessage);
    thing.setPropertyReadHandler("state", async () => coffeeMachine.state);
    thing.setPropertyReadHandler(
      "waterLevel",
      async () => coffeeMachine.waterLevel,
    );
    thing.setPropertyReadHandler(
      "beansAmount",
      async () => coffeeMachine.beansAmount,
    );
    thing.setPropertyReadHandler(
      "binLevel",
      async () => coffeeMachine.binLevel,
    );

    thing.setActionHandler("order", order);
    thing.setActionHandler("brew", brew);
    thing.setActionHandler("next", async () => {
      coffeeMachine.progress = 0;
      coffeeMachine.state = CoffeeMachineState.WAITING;
      console.log("starting next order");
      return undefined;
    });
    thing.setActionHandler("reset", async () => {
      errorMessage = "";
      coffeeMachine.progress = 0;
      coffeeMachine.state = CoffeeMachineState.WAITING;
      coffeeMachine.queue = [];
      console.log("Coffee machine reset");
      return undefined;
    });

    await thing.expose();
  } catch (error) {
    console.log(error);
    console.error("Coffee machine failed");
  }
});

const coffeeMachineTd = {
  "@context": ["https://www.w3.org/2019/wot/td/v1" as const],
  title: "Coffee Machine",
  description: "Test TD for learning purposes",
  properties: {
    progress: {
      description: "The progress of the current brewage in percent",
      type: "integer" as const,
      minimum: 0,
      maximum: 100,
      readonly: true,
    },
    error: {
      description: "Any error thrown will save its message in this property",
      type: "string" as const,
      readonly: true,
    },
    state: {
      type: "string" as const,
      description:
        "Current state of the coffee machine (Waiting, Brewing, Coffee Ready)",
      enum: [
        CoffeeMachineState.WAITING,
        CoffeeMachineState.BREWING,
        CoffeeMachineState.COFEE_READY,
      ],
      readOnly: true,
    },
    waterLevel: {
      type: "integer" as const,
      description: "Water level in the tank in percents",
      minimum: 0,
      maximum: 100,
      readOnly: true,
    },
    beansAmount: {
      type: "integer" as const,
      description: "Amount of beans left in percents",
      minimum: 0,
      maximum: 100,
      readOnly: true,
    },
    binLevel: {
      type: "integer" as const,
      description: "Level of fullness of the bin in percents",
      minimum: 0,
      maximum: 100,
      readOnly: true,
    },
  },
  actions: {
    order: {
      description: "Places a coffee order in the queue",
      input: {
        description: "Coffee type and strenght to brew",
        type: "object" as const,
        properties: {
          coffeeType: {
            type: "string" as const,
            description: "Coffee type (Cappuccino, Espresso, Latte Machiatto)",
            enum: [
              CoffeeType.CAPPUCCINO,
              CoffeeType.ESPRESSO,
              CoffeeType.LATTE_MACHIATTO,
            ],
          },
          strength: {
            type: "string" as const,
            description: "Coffee strength (No caffeine, Light, Medium, Strong)",
            enum: [
              Strength.NO_CAFFEINE,
              Strength.LIGHT,
              Strength.MEDIUM,
              Strength.STRONG,
            ],
          },
        },
      },
    },
    brew: {
      description: "Starts the brewing the first order in the queue",
    },
    next: {
      description: "Starts with the next order",
    },
    reset: {
      description: "Returns to inital state",
    },
  },
};

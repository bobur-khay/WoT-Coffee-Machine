import { Servient } from "@node-wot/core";
import { HttpServer } from "@node-wot/binding-http";
import {
  Cell,
  CoffeeMachineState,
  coffeeMachineTdUrl,
  coordinatesSchema,
} from "../../constants";
import { CoapClientFactory } from "@node-wot/binding-coap";

enum RobotState {
  OFF = "off",
  READY = "ready",
  GOING_TO_KITCHEN = "going to kitchen",
  WAITING_FOR_COFFEE = "waiting for the coffee machine",
  BRINGING_AN_ORDER = "bringing an oder",
}

interface Node {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic to end
  f: number; // Total cost (g + h)
  parent: Node | null;
}

class Robot {
  public constructor(
    public queue: number[][],
    public state: RobotState,
    public map: Cell[][],
    public position: number[],
    public coffeeMachinePosition: number[],
  ) {}
}

const servient = new Servient();
servient.addServer(new HttpServer({ port: 8081 }));

servient.start().then(async (WoT) => {
  try {
    const clientServient = new Servient();
    clientServient.addClientFactory(new CoapClientFactory());
    const client = await clientServient.start();
    // TODO: move to initialize
    const coffeeMachineTd =
      await client.requestThingDescription(coffeeMachineTdUrl);
    const coffeeMachineThing = await client.consume(coffeeMachineTd);
    console.log("Robot starting...");
    const thing = await WoT.produce(robotSchema);
    let robot: Robot | null = null;

    const initialize = async (params: any) => {
      const { map, position } = await params.value();
      console.log("robot position", position);
      const coffeeMachine = findCoffeeMachine(map);
      if (!coffeeMachine) {
        throw new Error("Coffee machine not found");
      }
      robot = new Robot([], RobotState.READY, map, position, coffeeMachine);
      console.log("Robot initialized");
      return undefined;
    };

    const findCoffeeMachine = (map: Cell): number[] | null => {
      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map.length; x++) {
          if (map[y][x] === Cell.COFFEE_MACHINE) {
            return [x, y];
          }
        }
      }
      return null;
    };

    const order = async (params: any) => {
      if (!robot) {
        console.log("error robot not initialized");
        throw new Error("Robot not initialized");
      }
      const tableNr = await params.value();
      robot.queue.push(tableNr);

      console.log("New order: ", tableNr);
      console.log("Queue: ", robot.queue);
      if (robot.queue.length === 1) {
        await serve(robot);
      }
      return undefined;
    };

    const serve = async (robot: Robot) => {
      let path = getShortestPath(
        robot.map,
        robot.position,
        robot.coffeeMachinePosition,
      );
      // go to coffee machine
      for (let newPosition of path) {
        robot.position = newPosition;
        thing.emitPropertyChange("position");
        console.log("position", newPosition);
        await new Promise((r) => setTimeout(r, 400));
      }
      console.log("serving...");
      const order = robot.queue[0];
      if (!order) return undefined;
      // wait until it's ready
      let state: any;
      while (state !== CoffeeMachineState.COFEE_READY) {
        const prop = await coffeeMachineThing.readProperty("state");
        state = await prop?.value();
        console.log("coffee state", state);
        await new Promise((r) => setTimeout(r, 400));
      }
      path = getShortestPath(robot.map, robot.position, order);
      // take it to the table
      await coffeeMachineThing.invokeAction("next");
      coffeeMachineThing.invokeAction("brew");
      for (let newPosition of path) {
        robot.position = newPosition;
        thing.emitPropertyChange("position");
        await new Promise((r) => setTimeout(r, 400));
      }
      robot.queue.shift();
      return serve(robot);
    };

    const getShortestPath = (
      map: Cell[][],
      start: number[],
      target: number[],
    ): number[][] => {
      const height = map.length;
      const width = map[0].length;

      // Helper to check bounds and walkability
      const isWalkable = (x: number, y: number): boolean => {
        if (x < 0 || x >= width || y < 0 || y >= height) return false;
        // Target is always walkable, even if it's an object
        if (x === target[0] && y === target[1]) return true;
        // Only "NONE" is traversable space
        return map[y][x] === Cell.NONE;
      };

      // Helper for heuristic (Octile distance for 8-way movement)
      const getHeuristic = (x: number, y: number): number => {
        const dx = Math.abs(x - target[0]);
        const dy = Math.abs(y - target[1]);
        const D = 1;
        const D2 = Math.SQRT2;
        return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
      };

      const openList: Node[] = [];
      const closedSet = new Set<string>();

      // Initialize start node
      const startNode: Node = {
        x: start[0],
        y: start[1],
        g: 0,
        h: getHeuristic(start[0], start[1]),
        f: 0,
        parent: null,
      };
      startNode.f = startNode.g + startNode.h;
      openList.push(startNode);

      while (openList.length > 0) {
        // Efficiently find node with lowest f score
        let lowestIndex = 0;
        for (let i = 1; i < openList.length; i++) {
          if (openList[i].f < openList[lowestIndex].f) {
            lowestIndex = i;
          }
        }

        const current = openList[lowestIndex];

        // Reached target
        if (current.x === target[0] && current.y === target[1]) {
          const path: number[][] = [];
          let temp: Node | null = current;
          while (temp) {
            path.push([temp.x, temp.y]);
            temp = temp.parent;
          }
          return path.reverse();
        }

        // Move current from open to closed
        openList.splice(lowestIndex, 1);
        closedSet.add(`${current.x},${current.y}`);

        // Generate neighbors (8 directions)
        // dx, dy, cost
        const directions = [
          [0, -1, 1],
          [0, 1, 1],
          [-1, 0, 1],
          [1, 0, 1], // Cardinal
          [-1, -1, Math.SQRT2],
          [1, -1, Math.SQRT2], // Diagonals
          [-1, 1, Math.SQRT2],
          [1, 1, Math.SQRT2],
        ];

        for (const [dx, dy, cost] of directions) {
          const neighborX = current.x + dx;
          const neighborY = current.y + dy;

          if (
            closedSet.has(`${neighborX},${neighborY}`) ||
            !isWalkable(neighborX, neighborY)
          ) {
            continue;
          }

          // Calculate tentative g score
          const tentativeG = current.g + cost;

          // Check if neighbor is already in open list
          const existingNode = openList.find(
            (n) => n.x === neighborX && n.y === neighborY,
          );

          if (!existingNode) {
            const h = getHeuristic(neighborX, neighborY);
            const newNode: Node = {
              x: neighborX,
              y: neighborY,
              g: tentativeG,
              h: h,
              f: tentativeG + h,
              parent: current,
            };
            openList.push(newNode);
          } else if (tentativeG < existingNode.g) {
            // Found a better path to existing neighbor
            existingNode.g = tentativeG;
            existingNode.f = tentativeG + existingNode.h;
            existingNode.parent = current;
          }
        }
      }

      // No path found
      return [];
    };

    thing.setPropertyReadHandler(
      "state",
      async () => robot?.state ?? RobotState.OFF,
    );
    thing.setPropertyReadHandler(
      "position",
      async () => robot?.position ?? null,
    );
    thing.setPropertyObserveHandler(
      "position",
      async () => robot?.position ?? null,
    );
    thing.setActionHandler("init", initialize);
    thing.setActionHandler("order", order);
    thing.setActionHandler("reset", async () => {
      if (robot) {
        robot.state = RobotState.READY;
      }
      console.log("Robot reset");
      return undefined;
    });
    await thing.expose();
  } catch (err) {
    console.log(err);
    console.error("Robot failed");
  }
});

const robotSchema = {
  "@context": ["https://www.w3.org/2019/wot/td/v1" as const],
  title: "Robot",
  description:
    "A robot that walks around taking coffee orders. After taking an order it immediately sends a signal to the smart coffee machine to start brewing.",
  properties: {
    state: {
      type: "string" as const,
      description: "Current state of the robot",
      enum: [
        RobotState.READY,
        RobotState.BRINGING_AN_ORDER,
        RobotState.GOING_TO_KITCHEN,
        RobotState.WAITING_FOR_COFFEE,
      ],
      readOnly: true,
    },
    position: {
      description: "Current coordinates of the robot",
      observable: true,
      ...coordinatesSchema,
    },
  },
  actions: {
    init: {
      description: "Initializes the robot",
      input: {
        description: "The map from the client and the robot's position",
        type: "object" as const,
        example: {
          map: [["none"]],
        },
        properties: {
          map: {
            type: "array" as const,
            items: {
              type: "array" as const,
              items: {
                type: "string" as const,
              },
            },
          },
          position: coordinatesSchema,
        },
      },
    },
    order: {
      description: "Takes an order and starts moving to the caffee machine",
      input: {
        description: "Table coordinates",
        ...coordinatesSchema,
      },
    },
    reset: {
      description: "Resets the robot",
    },
  },
  events: {
    move: {
      description: "Emitted when the robot has moved",
      data: coordinatesSchema,
    },
  },
};

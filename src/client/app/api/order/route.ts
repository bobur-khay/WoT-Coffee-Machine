import { Order, clientThings } from "../../../../constants";

// Make order
export async function POST(request: Request) {
  const { strength, tableNr, coffeeType } = (await request.json()) as Order;
  const { robot, coffeeMachine } = clientThings;

  await coffeeMachine?.invokeAction("order", {
    strength,
    coffeeType,
  });
  await robot?.invokeAction("order", tableNr);

  return new Response(null, { status: 200 });
}

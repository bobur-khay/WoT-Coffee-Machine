import { clientThings } from "../../../../constants";

export async function POST() {
  const { robot, coffeeMachine } = clientThings;
  await robot?.invokeAction("reset");
  await coffeeMachine?.invokeAction("reset");
  return new Response(null, { status: 200 });
}

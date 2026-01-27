import { HttpClientFactory } from "@node-wot/binding-http";
import Servient from "@node-wot/core";
import { clientThings } from "../../../../constants";

export async function POST(request: Request) {
  const servient = new Servient();
  servient.addClientFactory(new HttpClientFactory(null));
  const client = await servient.start();

  const robotTd = await client.requestThingDescription(
    "http://localhost:8081/robot",
  );
  const coffeeMachineTd = await client.requestThingDescription(
    "http://localhost:8080/coffee-machine",
  );
  const robot = await client.consume(robotTd);
  const coffeeMachine = await client.consume(coffeeMachineTd);
  if (!robot) {
    throw new Error("Could not consume robot");
  }
  if (!coffeeMachine) {
    throw new Error("Could not consume coffee machine TD");
  }
  clientThings.robot = robot;
  clientThings.coffeeMachine = coffeeMachine;

  console.log(coffeeMachine);

  const req = await request.json();
  await robot.invokeAction("init", req);

  return new Response(null, { status: 200 });
}

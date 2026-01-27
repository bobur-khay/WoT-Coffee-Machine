import { HttpClientFactory } from "@node-wot/binding-http";
import Servient from "@node-wot/core";
import {
  clientThings,
  coffeeMachineTdUrl,
  robotTdUrl,
} from "../../../../constants";
import { CoapClientFactory } from "@node-wot/binding-coap";

export async function POST(request: Request) {
  const servient = new Servient();
  servient.addClientFactory(new HttpClientFactory(null));
  servient.addClientFactory(new CoapClientFactory());
  const client = await servient.start();

  const robotTd = await client.requestThingDescription(robotTdUrl);
  const coffeeMachineTd =
    await client.requestThingDescription(coffeeMachineTdUrl);

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

  const req = await request.json();
  await robot.invokeAction("init", req);

  return new Response(null, { status: 200 });
}

import { NextResponse } from "next/server";
import { clientThings } from "../../../../../constants";

export async function GET() {
  const coffeeMachine = clientThings.coffeeMachine;
  const progressProp = await coffeeMachine?.readProperty("progress");
  const progress = await progressProp?.value();
  const errorProp = await coffeeMachine?.readProperty("error");
  const error = await errorProp?.value();
  console.log("coffee response", progressProp);
  console.log("coffee progress", progress);
  return NextResponse.json({ progress: progress ?? 0, error });
}

import { NextResponse } from "next/server";
import { clientThings } from "../../../../../constants";

export async function GET() {
  const coffeeMachine = clientThings.coffeeMachine;
  const prop = await coffeeMachine?.readProperty("progress");
  const progress = await prop?.value();

  return NextResponse.json(progress ?? 0);
}

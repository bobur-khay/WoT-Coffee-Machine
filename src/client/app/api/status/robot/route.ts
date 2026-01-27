import { NextResponse } from "next/server";
import { clientThings } from "../../../../../constants";

export async function GET() {
  const robot = clientThings.robot;
  const prop = await robot?.readProperty("position");
  const position = await prop?.value();
  return NextResponse.json(position ?? null);
}

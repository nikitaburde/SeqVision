import { NextResponse } from "next/server";

import { MODELS } from "@/constants/model";

export async function GET() {
  return NextResponse.json({ models: MODELS });
}

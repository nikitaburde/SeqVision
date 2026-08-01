import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ modelId: string; opId: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { modelId, opId } = await params;

  return NextResponse.json({
    modelId,
    opId,
    equation: "f_t = σ(W_f[h,x] + b_f)",
    atoms: [
      { opId: `${opId}-concat`, equationTermId: "[h,x]", startFrame: 0, endFrame: 12 },
      { opId: `${opId}-matmul`, equationTermId: "W_f[h,x]", startFrame: 13, endFrame: 30 },
      { opId: `${opId}-bias`, equationTermId: "+ b_f", startFrame: 31, endFrame: 40 },
      { opId: `${opId}-sigmoid`, equationTermId: "σ", startFrame: 41, endFrame: 55 },
    ],
  });
}

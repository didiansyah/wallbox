import { NextResponse } from "next/server";
import { tamperRun } from "@/lib/storage/local-store";

export async function POST(_request: Request, { params }: { params: Promise<{ runId:string }> }) {
  const { runId } = await params;
  const record = await tamperRun(runId);
  if (!record) return NextResponse.json({ error:"Run not found" }, { status:404 });
  return NextResponse.json({ run_id:runId, tampered:true, verify_url:`/verify/local-tampered/${runId}` });
}

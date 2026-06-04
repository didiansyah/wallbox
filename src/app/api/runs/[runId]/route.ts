import { NextResponse } from "next/server";
import { loadRun } from "@/lib/storage/local-store";

export async function GET(_request: Request, { params }: { params: Promise<{ runId:string }> }) {
  const { runId } = await params;
  const record = await loadRun(runId);
  if (!record) return NextResponse.json({ error:"Run not found" }, { status:404 });
  return NextResponse.json({ ...record.run, manifest:record.capsule.manifest, trace:record.capsule.trace, sources:record.capsule.sources, verdict:record.capsule.verdict, artifacts:record.capsule.artifacts, tampered:Boolean(record.tamperedCapsule) });
}

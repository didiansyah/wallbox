import Link from "next/link";
import { headers } from "next/headers";
import { Header } from "@/components/landing/header";
import { VerificationCard } from "@/components/verification/verification-card";
async function appOrigin(){ const h=await headers(); const host=h.get("x-forwarded-host") || h.get("host") || "localhost:3070"; const proto=h.get("x-forwarded-proto") || "http"; return `${proto}://${host}`; }
async function verify(id:string){ if(!id || id==='local-demo') return {status:'CERTIFICATE_NOT_FOUND', certificate_id:id, error:'Run a demo agent first, then open its verifier link.'}; const res=await fetch(`${await appOrigin()}/api/verify/${id}`, {cache:'no-store'}); return res.json(); }
export default async function VerifyPage({params}:{params:Promise<{certificateId?:string[]}>}){const id=(await params).certificateId?.join('/') || 'local-demo'; const data=await verify(id); return <main><Header/><div className="mx-auto max-w-7xl px-5 py-12"><div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[.2em] text-primary">Public verifier</p><h1 className="mt-2 break-all text-3xl font-semibold">{id}</h1></div><Link className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground" href="/run">Run new demo</Link></div><VerificationCard data={data}/></div></main>}

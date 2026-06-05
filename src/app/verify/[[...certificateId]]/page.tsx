import Link from "next/link";
import { headers } from "next/headers";
import { Header } from "@/components/landing/header";
import { CertificateSearch } from "@/components/verification/certificate-search";
import { VerificationCard } from "@/components/verification/verification-card";

async function appOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3070";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

async function verify(id: string) {
  if (!id || id === "local-demo") {
    return { status: "CERTIFICATE_NOT_FOUND", certificate_id: id, error: "Run a demo agent first, then open its verifier link or paste a certificate ID." };
  }
  const res = await fetch(`${await appOrigin()}/api/verify/${id}`, { cache: "no-store" });
  return res.json();
}

export default async function VerifyPage({ params }: { params: Promise<{ certificateId?: string[] }> }) {
  const id = (await params).certificateId?.join("/") || "local-demo";
  const data = await verify(id);

  return (
    <main className="wall-shell">
      <Header />
      <section className="wall-section wall-grid-bg">
        <div className="wall-container">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="wall-kicker">Public verifier</p>
              <h1 className="mt-3 max-w-4xl break-all text-4xl font-normal tracking-[-.045em] text-[#e7eaeb] md:text-6xl">{id}</h1>
              <p className="wall-copy mt-4">Paste a certificate ID to verify anchored hash vs recomputed capsule hash.</p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <CertificateSearch initialValue={id} />
              <Link className="wall-button wall-button-primary" href="/run">Run new demo</Link>
            </div>
          </div>
          <VerificationCard data={data} />
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { Header } from "@/components/landing/header";
import { RunPanel } from "@/components/dashboard/run-panel";

export default function RunPage() {
  return (
    <main className="wall-shell">
      <Header />
      <section className="wall-section wall-grid-bg">
        <div className="wall-container">
          <Link href="/" className="wall-button mb-6">← Back to landing</Link>
          <RunPanel />
        </div>
      </section>
    </main>
  );
}

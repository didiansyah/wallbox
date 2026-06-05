import { CheckCircle2, Database, FileCheck2, KeyRound, RadioTower } from "lucide-react";
import { shortHash } from "@/lib/capsule/hash";

const hash = "0xb8a7624d9f3c80aa9ed21e114adfc26bb7d44cd5a3d782fa9081b1cb1ab3027e";

export function DashboardPreview() {
  const rows = [
    { icon: FileCheck2, label: "Agent trace", value: "5 captured steps", status: "OK" },
    { icon: Database, label: "Walrus blob", value: "testnet/qwGR...KEE", status: "PINNED" },
    { icon: KeyRound, label: "Sui certificate", value: "0xa3e8...a8aa", status: "ANCHORED" },
    { icon: CheckCircle2, label: "Capsule hash", value: shortHash(hash), status: "MATCH" },
  ];

  return (
    <div className="wall-panel relative overflow-hidden p-4">
      <div className="absolute right-5 top-5 opacity-30"><RadioTower className="text-[#00d497]" size={72} /></div>
      <div className="mb-4 flex items-center justify-between border-b border-[#292f31] pb-3">
        <div>
          <p className="wall-kicker">FIG. 01 / Verification console</p>
          <p className="wall-code mt-2">RUN wallbox_20260605_testnet</p>
        </div>
        <span className="wall-status">Verified</span>
      </div>

      <div className="grid gap-2">
        {rows.map((item) => (
          <div key={item.label} className="grid grid-cols-[1fr_auto] gap-3 border border-[#292f31] bg-[#0d1316] p-3">
            <div className="flex items-center gap-3 text-sm text-[#e7eaeb]">
              <item.icon className="text-[#00d497]" size={17} />
              <span>{item.label}</span>
            </div>
            <div className="text-right">
              <code className="wall-code text-[#b8bdbf]">{item.value}</code>
              <p className="wall-mono mt-1 text-[9px] uppercase tracking-[.12em] text-[#00d497]">{item.status}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border border-[#236a4c] bg-[#003931]/70 p-3 wall-code text-[#00d497]">
        $ wallbox verify --cert 0xa3e8…a8aa<br />
        fetch walrus blob → recompute sha256 → compare sui object → integrity verified
      </div>

      <div className="mt-5 wall-led-bars" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => <span key={i} style={{ height: `${12 + ((i * 17) % 62)}px` }} />)}
      </div>
    </div>
  );
}

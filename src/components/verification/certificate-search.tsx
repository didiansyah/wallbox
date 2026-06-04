"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CertificateSearch({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue === "local-demo" ? "" : initialValue);
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = value.trim();
    if (!id) return;
    router.push(`/verify/${id}`);
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-card p-3 sm:max-w-xl sm:flex-row">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Paste certificate ID or local-tampered/run_id"
        className="min-w-0 flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        <Search size={16} />
        Verify
      </button>
    </form>
  );
}

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
    <form onSubmit={submit} className="flex w-full flex-col gap-2 border border-[#292f31] bg-[#101618] p-2 sm:max-w-xl sm:flex-row">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Paste certificate ID or local-tampered/run_id"
        className="min-w-0 flex-1 border border-[#292f31] bg-[#080f11] px-3 py-2 text-sm text-[#e7eaeb] outline-none placeholder:text-[#4d5558] focus:border-[#00d497]"
      />
      <button className="wall-button wall-button-primary">
        <Search size={16} />
        Verify
      </button>
    </form>
  );
}

import Link from "next/link";
import { Header } from "@/components/landing/header";
import { RunPanel } from "@/components/dashboard/run-panel";
export default function RunPage(){return <main><Header/><div className="grid-bg mx-auto max-w-7xl px-5 py-12"><Link href="/" className="text-sm text-muted-foreground">Back to landing</Link><div className="mt-6"><RunPanel/></div></div></main>}

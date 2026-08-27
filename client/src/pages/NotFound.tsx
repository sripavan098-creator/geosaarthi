import { Button } from "@/components/ui/button";
import { ArrowRight, Orbit, SearchX } from "lucide-react";
import { Link } from "wouter";
import "../operatingSystem.css";

export default function NotFound() {
  return (
    <main className="os-fallback">
      <div className="os-fallback-grid" />
      <section>
        <div className="os-fallback-mark"><Orbit className="size-7" /></div>
        <p>ROUTE RESOLUTION / 404</p>
        <h1>That mission surface is outside the mapped system.</h1>
        <span><SearchX className="size-4" /> No registered Earth Intelligence route matches this address.</span>
        <div><Link href="/">Return to Earth <ArrowRight className="size-4" /></Link><Link href="/dashboard">Open mission control</Link></div>
      </section>
    </main>
  );
}

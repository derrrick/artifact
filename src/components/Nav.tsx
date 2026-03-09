"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  function handleIndexClick(e: React.MouseEvent) {
    e.preventDefault();
    if (pathname === "/") {
      document.getElementById("themes")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#themes");
    }
  }

  return (
    <nav className="relative z-50 flex items-center justify-between px-4 md:px-[60px] py-1.5 md:py-7 w-full shrink-0">
      <Link href="/" className="flex items-center gap-2 md:gap-3 group">
        <span className="font-[family-name:var(--font-unbounded)] text-[13px] md:text-[15px] font-bold tracking-[0.2em] uppercase text-white group-hover:text-[var(--canary)] transition-colors">ARTIFACT</span>
        <span className="text-[13px] md:text-[15px] font-light tracking-[0.2em] text-[#FA4D31] group-hover:text-[var(--canary)] transition-colors">探求者</span>
      </Link>
      <div className="flex items-center gap-5 md:gap-10">
        <button
          onClick={handleIndexClick}
          className="font-[family-name:var(--font-mono)] text-[11px] md:text-[12px] tracking-[0.2em] uppercase transition-colors cursor-pointer relative z-50"
          style={{ color: "var(--text-muted)", background: "none", border: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--canary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          Index
        </button>
        <Link
          href="/explore"
          className="flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 font-[family-name:var(--font-mono)] text-[10px] md:text-[11px] font-semibold tracking-[0.2em] uppercase transition-all hover:bg-[rgba(250,77,49,0.1)] rounded-full"
          style={{ border: "1px solid var(--terracotta)", color: "var(--terracotta)" }}
        >
          Explore
        </Link>
      </div>
    </nav>
  );
}

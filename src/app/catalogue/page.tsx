"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import { StarIcon, GoldLine } from "@/components/Ornaments";
import { allSites, buckets, bucketLabels, bucketColors, getFilteredSites } from "@/data/sites";

function toRoman(num: number): string {
  if (num <= 0 || num > 4000) return String(num);
  const lookup: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  for (const [value, symbol] of lookup) {
    while (num >= value) { result += symbol; num -= value; }
  }
  return result;
}

export default function IndexPage() {
  const [activeBucket, setActiveBucket] = useState<string | null>(null);
  const router = useRouter();

  const sites = [...getFilteredSites(activeBucket)].sort((a, b) => a.name.localeCompare(b.name));

  function handleSiteClick(site: typeof allSites[0]) {
    const params = new URLSearchParams({
      url: site.url,
      name: site.name,
      bucket: site.bucketId,
    });
    if (activeBucket) params.set("filter", activeBucket);
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-4 md:gap-5 px-5 md:px-[60px] pt-4 md:pt-6 pb-6 md:pb-8"
      >
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(233,240,85,0.3))" }} />
          <div className="flex items-center gap-3">
            <StarIcon size={10} />
            <span className="text-[12px] font-medium tracking-[0.35em] uppercase" style={{ color: "#E9F055" }}>
              The Index
            </span>
            <StarIcon size={10} />
          </div>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(270deg, transparent, rgba(233,240,85,0.3))" }} />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-2.5">
          <button
            onClick={() => setActiveBucket(null)}
            className="flex items-center gap-1.5 px-4 py-2 text-[11px] tracking-[0.15em] uppercase transition-all cursor-pointer"
            style={{
              border: !activeBucket ? "1px solid #E9F055" : "1px solid rgba(255,255,255,0.08)",
              color: !activeBucket ? "#E9F055" : "rgba(255,255,255,0.5)",
              background: !activeBucket ? "rgba(233,240,85,0.06)" : "rgba(255,255,255,0.02)",
            }}
          >
            All
          </button>
          {buckets.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBucket(b.id === activeBucket ? null : b.id)}
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] tracking-[0.15em] uppercase transition-all cursor-pointer"
              style={{
                border: activeBucket === b.id ? `1px solid ${bucketColors[b.id]}` : "1px solid rgba(255,255,255,0.08)",
                color: activeBucket === b.id ? bucketColors[b.id] : "rgba(255,255,255,0.5)",
                background: activeBucket === b.id ? `${bucketColors[b.id]}10` : "rgba(255,255,255,0.02)",
              }}
            >
              <svg width={6} height={6} viewBox="0 0 6 6">
                <rect x="3" y="0.7" width="3.3" height="3.3" transform="rotate(45 3 3)" fill={bucketColors[b.id]} opacity={0.6} />
              </svg>
              {bucketLabels[b.id]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="px-5 md:px-[60px]">
        <GoldLine />
      </div>

      {/* Site list */}
      <div className="flex flex-col px-5 md:px-[60px] pb-16">
        {sites.map((site, i) => (
          <motion.button
            key={site.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.02, 0.5), duration: 0.4 }}
            onClick={() => handleSiteClick(site)}
            className="group flex items-center py-4 md:py-6 cursor-pointer transition-colors border-b"
            style={{ borderColor: "rgba(233,240,85,0.06)" }}
          >
            {/* Roman numeral */}
            <span
              className="w-[36px] md:w-[60px] shrink-0 text-[10px] md:text-[11px] tracking-[0.1em] text-right pr-3 md:pr-6 transition-colors group-hover:text-[#E9F055]"
              style={{ color: "var(--text-dim)" }}
            >
              {toRoman(i + 1)}
            </span>

            {/* Site name */}
            <span
              className="font-[family-name:var(--font-unbounded)] text-[20px] md:text-[28px] uppercase transition-colors group-hover:text-[#E9F055] truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {site.name}
            </span>

            {/* Spacer */}
            <div className="flex-1 min-w-2" />

            {/* Category badge */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0 mr-0 md:mr-10">
              <div className="w-[6px] h-[6px] md:w-[7px] md:h-[7px] rounded-sm" style={{ background: bucketColors[site.bucketId] }} />
              <span
                className="text-[9px] md:text-[11px] tracking-[0.15em] uppercase hidden sm:inline"
                style={{ color: bucketColors[site.bucketId] }}
              >
                {bucketLabels[site.bucketId]}
              </span>
            </div>

            {/* Year in roman */}
            <span
              className="shrink-0 text-[10px] md:text-[11px] tracking-[0.1em] transition-colors hidden md:inline"
              style={{ color: "var(--text-dim)" }}
            >
              MMXXV
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import { StarIcon, GoldLine } from "@/components/Ornaments";
import { buckets, bucketLabels, bucketColors, getFilteredSites } from "@/data/sites";
import { SmokeRing, Warp } from "@paper-design/shaders-react";
import gsap from "gsap";

/* ─── Palette constants ─── */
const MIDNIGHT = "#351F28";
const CANARY = "#E9F055";
const TERRACOTTA = "#FA4D31";
const CHARCOAL = "#374852";
const ASH = "#ADB8A0";
const PALE_SKY = "#D8EFFE";
const SILVER = "#CCC7C6";
const GREY = "#737D7F";

/* ─── Dominion number colors (cycling) ─── */
const dominionColors = [TERRACOTTA, CANARY, PALE_SKY, ASH, TERRACOTTA, CANARY, PALE_SKY, ASH, TERRACOTTA, CANARY];

/* ─── Hero "ILLUMINATED" text with sweep ─── */
function IlluminateText() {
  const sweepRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = sweepRef.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, filter: "blur(0px) brightness(1)" });

    const tl = gsap.timeline({ delay: 1.8 });
    tl.to(el, { opacity: 1, filter: "blur(1px) brightness(2)", duration: 0.2, ease: "power2.out" });
    tl.to(el, { filter: "blur(0px) brightness(1.5)", duration: 0.15, ease: "power2.out" });
    tl.fromTo(el, { backgroundPosition: "100% 100%" }, { backgroundPosition: "0% 0%", duration: 0.8, ease: "power2.inOut" }, 0.1);
    tl.to(el, { opacity: 0, filter: "blur(2px) brightness(1)", duration: 0.7, ease: "power1.out" }, "-=0.2");
  }, []);

  return (
    <div className="relative inline-block">
      <span
        className="font-[family-name:var(--font-unbounded)] text-[48px] md:text-[100px] lg:text-[142px] font-black uppercase leading-[1.02] tracking-[-0.03em]"
        style={{ color: CANARY }}
      >
        Illuminated
      </span>
      <span
        ref={sweepRef}
        className="font-[family-name:var(--font-unbounded)] text-[48px] md:text-[100px] lg:text-[142px] font-black uppercase leading-[1.02] tracking-[-0.03em] absolute inset-0"
        style={{
          background: `linear-gradient(315deg, ${CANARY} 0%, ${CANARY} 30%, #FFFFFF 42%, #FEFFF0 50%, #FFFFFF 58%, ${CANARY} 70%, ${CANARY} 100%)`,
          backgroundSize: "300% 300%",
          backgroundPosition: "100% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          opacity: 0,
        }}
        aria-hidden="true"
      >
        Illuminated
      </span>
    </div>
  );
}

/* ─── Explore CTA pill ─── */
function ExplorePill({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.0, duration: 0.15 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
      whileTap={{ scale: 0.96, transition: { duration: 0.05 } }}
      onClick={onClick}
      className="flex items-center gap-[15px] rounded-full cursor-pointer shrink-0 h-[52px] md:h-[86px] px-6 md:px-12 w-fit md:w-[364px] justify-center transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_30px_rgba(250,77,49,0.4)]"
      style={{ backgroundColor: TERRACOTTA }}
    >
      <span className="font-[family-name:var(--font-unbounded)] text-[14px] md:text-[20px] font-bold tracking-[0.12em] uppercase" style={{ color: "#FBF8F6" }}>
        Explore now
      </span>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="w-5 h-5 md:w-[27px] md:h-[28px] shrink-0">
        <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="#FBF8F6" strokeWidth="2" />
      </svg>
    </motion.button>
  );
}

/* ─── Page ─── */
export default function Home() {
  const [activeBucket, setActiveBucket] = useState<string | null>(null);
  const router = useRouter();

  function handleSeek() {
    const pool = getFilteredSites(activeBucket);
    const randomIndex = Math.floor(Math.random() * pool.length);
    const site = pool[randomIndex];
    const params = new URLSearchParams({
      url: site.url,
      name: site.name,
      bucket: site.bucketId,
    });
    if (activeBucket) params.set("filter", activeBucket);
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "#0A0A0A" }}>

      {/* ═══ HERO — Midnight Violet full-bleed ═══ */}
      <section className="relative min-h-[50vh] md:min-h-screen flex flex-col overflow-hidden" style={{ background: "#0A0A0A" }}>
        <div className="absolute inset-0 pointer-events-none z-0">
          <Warp
            speed={2.1}
            scale={5}
            softness={0.06}
            proportion={0.45}
            swirl={1.67}
            swirlIterations={2}
            shape="checks"
            distortion={0.86}
            shapeScale={0.2}
            colors={["#121212", "#121212", "#351F28", "#FA4D31"]}
            style={{ width: "100%", height: "100%", pointerEvents: "none" }}
          />
        </div>

        <div className="relative z-50">
          <Nav />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 md:px-[60px] lg:px-[76px] mt-[-20px] md:mt-[-180px]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center w-full max-w-[1288px]"
          >
            {/* Line 1: FEED YOUR */}
            <h1
              className="font-[family-name:var(--font-unbounded)] text-[45px] sm:text-[60px] md:text-[100px] lg:text-[180px] font-black uppercase leading-[0.94] tracking-[-0.04em]"
              style={{ color: "#FBF8F6" }}
            >
              Feed Your
            </h1>

            {/* Line 2: AESTHETIC */}
            <span
              className="font-[family-name:var(--font-unbounded)] text-[45px] sm:text-[60px] md:text-[100px] lg:text-[180px] font-black uppercase leading-[0.98] tracking-[-0.04em]"
              style={{ color: CANARY }}
            >
              Aesthetic
            </span>

            {/* Line 3: ADDICTION */}
            <span
              className="font-[family-name:var(--font-unbounded)] text-[45px] sm:text-[60px] md:text-[100px] lg:text-[180px] font-black uppercase leading-[0.98] tracking-[-0.04em]"
              style={{ color: "#FBF8F6" }}
            >
              Addiction
            </span>

            {/* Explore pill — centered below */}
            <div className="flex justify-center w-full mt-6 md:mt-12">
              <ExplorePill onClick={handleSeek} />
            </div>

          </motion.div>
        </div>

        {/* Themes anchor — pinned near bottom */}
        <button
          onClick={() => document.getElementById("themes")?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 cursor-pointer group"
        >
          <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.4em] uppercase transition-opacity group-hover:opacity-100" style={{ color: CANARY, opacity: 0.7 }}>Themes</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-y-1 animate-bounce">
            <path d="M7 2V12M7 12L2 7M7 12L12 7" stroke={CANARY} strokeWidth="1.5" />
          </svg>
        </button>

        {/* Bottom edge fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
          background: "linear-gradient(to top, #0A0A0A, transparent)",
        }} />
      </section>

      {/* ═══ DOMINION LIST — Editorial numbered ═══ */}
      <section id="themes" className="relative py-14 md:py-32 px-4 md:px-[60px]" style={{ background: MIDNIGHT }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-4 mb-16"
        >
          <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.5em] uppercase" style={{ color: GREY }}>
            Explore by Theme
          </span>
          <GoldLine />
        </motion.div>

        <div className="max-w-[900px] mx-auto flex flex-col">
          {buckets.map((b, i) => {
            const numColor = dominionColors[i % dominionColors.length];
            const count = b.sources.length;
            return (
              <motion.button
                key={b.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                onClick={() => {
                  const pool = getFilteredSites(b.id);
                  const site = pool[Math.floor(Math.random() * pool.length)];
                  const params = new URLSearchParams({
                    url: site.url,
                    name: site.name,
                    bucket: site.bucketId,
                    filter: b.id,
                  });
                  router.push(`/explore?${params.toString()}`);
                }}
                className="group flex items-center gap-3 md:gap-8 py-4 md:py-7 cursor-pointer transition-all border-b hover:opacity-100"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <span
                  className="font-[family-name:var(--font-unbounded)] text-[22px] md:text-[40px] font-bold w-[44px] md:w-[80px] shrink-0 text-right transition-opacity group-hover:opacity-100"
                  style={{ color: CANARY, opacity: 0.6 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="font-[family-name:var(--font-unbounded)] text-[14px] md:text-[24px] font-semibold uppercase tracking-[0.05em] transition-colors text-left group-hover:text-white"
                  style={{ color: SILVER }}
                >
                  {bucketLabels[b.id] || b.name}
                </span>
                <div className="flex-1" />
                <span className="hidden md:inline font-[family-name:var(--font-mono)] text-[11px] tracking-[0.15em] uppercase shrink-0" style={{ color: GREY }}>
                  {count} sites
                </span>
                <div
                  className="hidden md:block w-3 h-3 rounded-full shrink-0 transition-all group-hover:scale-125"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                />
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ═══ SPLIT MANIFESTO ═══ */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">
        {/* Left — Charcoal Blue */}
        <div className="flex flex-col justify-center px-6 md:px-16 lg:px-24 py-14 md:py-20" style={{ background: CHARCOAL }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6"
          >
            <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.5em] uppercase" style={{ color: ASH }}>
              Why Artifact
            </span>
            <h2 className="font-[family-name:var(--font-unbounded)] text-[24px] md:text-[44px] font-bold uppercase leading-[1.05] tracking-[-0.01em] text-white">
              Discover design worth getting lost in — and keep coming back for more
            </h2>
            <p className="font-[family-name:var(--font-mono)] text-[13px] leading-7" style={{ color: SILVER }}>
              From boundary-pushing type studios to immersive editorial worlds, Artifact catalogs the sites that prove the web is still the most exciting canvas on earth.
            </p>
          </motion.div>
        </div>

        {/* Right — Canary Yellow */}
        <div className="flex flex-col justify-center px-6 md:px-16 lg:px-24 py-14 md:py-20" style={{ background: CANARY }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col gap-8"
          >
            <div className="flex gap-8 md:gap-16">
              <div className="flex flex-col gap-1">
                <span className="font-[family-name:var(--font-unbounded)] text-[32px] md:text-[56px] font-bold leading-[1]" style={{ color: MIDNIGHT }}>
                  836
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase" style={{ color: CHARCOAL }}>
                  Curated Sites
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-[family-name:var(--font-unbounded)] text-[32px] md:text-[56px] font-bold leading-[1]" style={{ color: MIDNIGHT }}>
                  {buckets.length}
                </span>
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase" style={{ color: CHARCOAL }}>
                  Themes
                </span>
              </div>
            </div>
            <p className="font-[family-name:var(--font-mono)] text-[13px] leading-7" style={{ color: CHARCOAL }}>
              Each site is hand-reviewed and categorized into themes — curated collections that map the landscape of exceptional web design.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="flex flex-col items-center gap-6 md:gap-8 py-16 md:py-32 px-5" style={{ background: "#0A0A0A" }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6"
        >
          <StarIcon size={16} color={CANARY} />
          <h3 className="font-[family-name:var(--font-unbounded)] text-[22px] md:text-[44px] font-bold uppercase text-center leading-[1.05] tracking-[-0.01em] text-white">
            Ready to explore?
          </h3>
          <p className="font-[family-name:var(--font-mono)] text-[13px] text-center max-w-[380px] leading-7" style={{ color: GREY }}>
            Let the artifact guide you to your next source of inspiration.
          </p>
        </motion.div>
        <ExplorePill onClick={handleSeek} />
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="flex flex-col items-center gap-4 py-12 px-5" style={{ background: MIDNIGHT }}>
        <div className="flex items-center gap-3">
          <span className="font-[family-name:var(--font-unbounded)] text-[12px] font-bold tracking-[0.2em] uppercase text-white">ARTIFACT</span>
          <span className="text-[12px] font-light tracking-[0.2em]" style={{ color: SILVER }}>探求者</span>
        </div>
        <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.3em] uppercase" style={{ color: GREY }}>
          The web&apos;s finest inspiration — MMXXVI
        </span>
      </footer>
    </div>
  );
}

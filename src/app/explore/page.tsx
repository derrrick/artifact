"use client";

import { useState, useCallback, useMemo, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import Nav from "@/components/Nav";
import { LoadingSigil, StarIcon } from "@/components/Ornaments";
import { allSites, buckets, bucketLabels, bucketColors, getFilteredSites } from "@/data/sites";

function FilterModal({
  activeFilters,
  onToggle,
  onClose,
}: {
  activeFilters: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#351F28]/90 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col gap-8 px-8 py-10 md:px-14 md:py-12 mx-4 md:mx-0 rounded-2xl max-w-[600px] w-full"
        style={{
          background: "#0A0A0A",
          border: "1px solid rgba(233,240,85,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.5em] uppercase" style={{ color: "#737D7F" }}>
            Explore by
          </span>
          <span className="font-[family-name:var(--font-unbounded)] text-[28px] md:text-[36px] font-bold uppercase tracking-[-0.02em] text-white">
            Theme
          </span>
        </div>

        <div className="flex flex-col">
          {buckets.map((b, i) => {
            const isActive = activeFilters.has(b.id);
            return (
              <button
                key={b.id}
                onClick={() => onToggle(b.id)}
                className="group flex items-center gap-4 py-3.5 cursor-pointer transition-all border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <span
                  className="font-[family-name:var(--font-unbounded)] text-[18px] md:text-[22px] font-bold w-[40px] shrink-0 text-right"
                  style={{ color: "#E9F055", opacity: isActive ? 1 : 0.4 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="font-[family-name:var(--font-unbounded)] text-[14px] md:text-[16px] font-semibold uppercase tracking-[0.05em] transition-colors"
                  style={{ color: isActive ? "#fff" : "#CCC7C6" }}
                >
                  {bucketLabels[b.id]}
                </span>
                <div className="flex-1" />
                <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.15em] uppercase" style={{ color: "#737D7F" }}>
                  {b.sources.length}
                </span>
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 transition-all"
                  style={{
                    background: isActive ? "#E9F055" : "transparent",
                    border: isActive ? "1px solid #E9F055" : "1px solid rgba(255,255,255,0.15)",
                  }}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.2em] uppercase" style={{ color: "#737D7F" }}>
            {activeFilters.size === 0 ? "All themes" : `${activeFilters.size} selected`}
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-[family-name:var(--font-unbounded)] text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-150 hover:brightness-110 hover:shadow-[0_0_20px_rgba(250,77,49,0.3)] cursor-pointer"
            style={{ background: "#FA4D31", color: "#FBF8F6" }}
          >
            Apply
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentUrl = searchParams.get("url") || "";
  const currentName = searchParams.get("name") || "";
  const currentBucket = searchParams.get("bucket") || "";
  const activeFilter = searchParams.get("filter") || null;

  // If no URL param, redirect to a random site
  useEffect(() => {
    if (!currentUrl) {
      const pool = getFilteredSites(null);
      const site = pool[Math.floor(Math.random() * pool.length)];
      const params = new URLSearchParams({ url: site.url, name: site.name, bucket: site.bucketId });
      router.replace(`/explore?${params.toString()}`);
    }
  }, [currentUrl, router]);

  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [auditMode, setAuditMode] = useState(false);
  const [auditStats, setAuditStats] = useState({ kept: 0, deleted: 0 });
  const auditIndex = useRef(0);
  const auditBucketIndex = useRef(0);
  const auditModeRef = useRef(false);
  const auditKeepRef = useRef<() => void>(() => {});
  const auditDeleteRef = useRef<() => void>(() => {});

  // Multi-select filters
  const [activeFilters, setActiveFilters] = useState<Set<string>>(() => {
    return activeFilter ? new Set(activeFilter.split(",")) : new Set();
  });

  // History stack for back navigation
  const historyStack = useRef<typeof allSites[0][]>([]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const iframeWrapRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const curtainTopRef = useRef<HTMLDivElement>(null);
  const curtainBotRef = useRef<HTMLDivElement>(null);
  const pendingNav = useRef<typeof allSites[0] | null>(null);

  // Build pool from multi-select filters
  const pool = useMemo(() => {
    if (activeFilters.size === 0) return allSites;
    return allSites.filter((s) => activeFilters.has(s.bucketId));
  }, [activeFilters]);

  const currentIndex = useMemo(() => pool.findIndex((s) => s.url === currentUrl), [pool, currentUrl]);
  const currentSite = useMemo(() => pool.find((s) => s.url === currentUrl) || allSites.find((s) => s.url === currentUrl) || pool[0], [pool, currentUrl]);
  const isBlocked = currentSite?.iframeBlocked === true;

  // Get next site: sequential if filtered, random if not
  const getNextSite = useCallback(() => {
    if (activeFilters.size > 0) {
      return currentIndex < pool.length - 1 ? pool[currentIndex + 1] : pool[0];
    }
    const filtered = pool.filter((s) => s.url !== currentUrl);
    return filtered[Math.floor(Math.random() * filtered.length)] || pool[0];
  }, [pool, currentUrl, currentIndex, activeFilters]);

  // Get previous site from history
  const getPrevSite = useCallback(() => {
    if (historyStack.current.length > 0) {
      return historyStack.current[historyStack.current.length - 1];
    }
    // Fallback: sequential prev if filtered, random if not
    if (activeFilters.size > 0) {
      return currentIndex > 0 ? pool[currentIndex - 1] : pool[pool.length - 1];
    }
    const filtered = pool.filter((s) => s.url !== currentUrl);
    return filtered[Math.floor(Math.random() * filtered.length)] || pool[0];
  }, [pool, currentUrl, currentIndex, activeFilters]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const prevSite = mounted ? getPrevSite() : pool[0] || allSites[0];
  const nextSite = mounted ? getNextSite() : pool[0] || allSites[0];

  // Toggle filter
  const toggleFilter = useCallback((id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Reveal animation
  const playReveal = useCallback(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setLoading(false);
        if (overlayRef.current) {
          overlayRef.current.style.pointerEvents = "none";
          overlayRef.current.style.visibility = "hidden";
        }
      },
    });
    // Flash the center line
    tl.fromTo(scanLineRef.current, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.15, ease: "power4.out" }, 0);
    tl.to(scanLineRef.current, { opacity: 0, duration: 0.5, ease: "power2.out" }, 0.3);
    // Curtains open from center
    tl.to(curtainTopRef.current, { height: "0%", duration: 0.7, ease: "power3.inOut" }, 0.1);
    tl.to(curtainBotRef.current, { height: "0%", duration: 0.7, ease: "power3.inOut" }, 0.1);
    // Content fades in
    tl.fromTo(iframeWrapRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.2);
    tl.to(overlayRef.current, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 0.15);
  }, []);

  // Exit animation
  const playExit = useCallback((site: typeof allSites[0]) => {
    if (transitioning) return;
    setTransitioning(true);
    pendingNav.current = site;

    if (overlayRef.current) {
      overlayRef.current.style.pointerEvents = "auto";
      overlayRef.current.style.visibility = "visible";
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setTransitioning(false);
        const s = pendingNav.current!;
        setLoading(true);
        setIframeError(false);
        setUseProxy(false);

        const params = new URLSearchParams({ url: s.url, name: s.name, bucket: s.bucketId });
        if (activeFilters.size > 0) params.set("filter", [...activeFilters].join(","));
        router.push(`/explore?${params.toString()}`);
      },
    });
    // Content fades
    tl.to(iframeWrapRef.current, { opacity: 0, duration: 0.3, ease: "power3.in" }, 0);
    // Curtains close from top/bottom to center
    tl.fromTo(curtainTopRef.current, { height: "0%" }, { height: "50%", duration: 0.4, ease: "power3.in" }, 0);
    tl.fromTo(curtainBotRef.current, { height: "0%" }, { height: "50%", duration: 0.4, ease: "power3.in" }, 0);
    // Flash line when curtains meet
    tl.fromTo(scanLineRef.current, { opacity: 0, scaleX: 1 }, { opacity: 1, duration: 0.08, ease: "none" }, 0.35);
    tl.to(scanLineRef.current, { opacity: 0, scaleX: 0, duration: 0.3, ease: "power2.out" }, 0.43);
    // Overlay comes in
    tl.to(overlayRef.current, { opacity: 1, duration: 0.2, ease: "power2.in" }, 0.35);
  }, [transitioning, activeFilters, router]);

  // Reset on new load
  useEffect(() => {
    if (loading) {
      gsap.set(overlayRef.current, { opacity: 1 });
      gsap.set(iframeWrapRef.current, { opacity: 0 });
      gsap.set(curtainTopRef.current, { height: "50%" });
      gsap.set(curtainBotRef.current, { height: "50%" });
      gsap.set(scanLineRef.current, { opacity: 0, scaleX: 0 });
    }
  }, [loading]);

  const navigateTo = useCallback(
    (site: typeof allSites[0], isBack = false) => {
      // Push current site to history (unless going back)
      if (!isBack && currentSite) {
        historyStack.current.push(currentSite);
        if (historyStack.current.length > 50) historyStack.current.shift();
      }
      // Pop from history if going back
      if (isBack && historyStack.current.length > 0) {
        historyStack.current.pop();
      }

      if (!loading && !transitioning) {
        playExit(site);
      } else {
        setLoading(true);
        setIframeError(false);
        setUseProxy(false);
        const params = new URLSearchParams({ url: site.url, name: site.name, bucket: site.bucketId });
        if (activeFilters.size > 0) params.set("filter", [...activeFilters].join(","));
        router.push(`/explore?${params.toString()}`);
      }
    },
    [router, activeFilters, loading, transitioning, playExit, currentSite]
  );

  // Audit: get next site linearly through buckets
  const getAuditNext = useCallback(() => {
    let bIdx = auditBucketIndex.current;
    let sIdx = auditIndex.current + 1;
    while (bIdx < buckets.length) {
      const sources = buckets[bIdx].sources;
      if (sIdx < sources.length) {
        auditBucketIndex.current = bIdx;
        auditIndex.current = sIdx;
        const s = sources[sIdx];
        return { ...s, bucketId: buckets[bIdx].id, bucketName: buckets[bIdx].name };
      }
      bIdx++;
      sIdx = 0;
    }
    return null; // done
  }, []);

  const auditNavigateNext = useCallback(() => {
    const next = getAuditNext();
    if (next) {
      navigateTo(next);
    } else {
      setAuditMode(false);
    }
  }, [getAuditNext, navigateTo]);

  const auditKeep = useCallback(() => {
    setAuditStats((s) => ({ ...s, kept: s.kept + 1 }));
    auditNavigateNext();
  }, [auditNavigateNext]);

  const auditDelete = useCallback(() => {
    if (!currentUrl) return;
    // Fire and forget — don't await
    fetch(`/api/audit?url=${encodeURIComponent(currentUrl)}`, { method: "DELETE" }).catch(() => {});
    setAuditStats((s) => ({ ...s, deleted: s.deleted + 1 }));
    // After delete, the current index effectively shifts, so don't increment
    auditIndex.current -= 1;
    auditNavigateNext();
  }, [currentUrl, auditNavigateNext]);

  // Keep refs in sync for keyboard handler
  useEffect(() => { auditModeRef.current = auditMode; }, [auditMode]);
  useEffect(() => { auditKeepRef.current = auditKeep; }, [auditKeep]);
  useEffect(() => { auditDeleteRef.current = auditDelete; }, [auditDelete]);

  const seekRandom = useCallback(() => {
    const filtered = pool.filter((s) => s.url !== currentUrl);
    const site = filtered[Math.floor(Math.random() * filtered.length)] || pool[0];
    navigateTo(site);
  }, [pool, currentUrl, navigateTo]);

  const handleIframeLoad = useCallback(() => {
    playReveal();
  }, [playReveal]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (showFilterModal) {
        if (e.key === "Escape") setShowFilterModal(false);
        return;
      }
      if (e.key === "a" || e.key === "A") {
        setAuditMode((v) => {
          const next = !v;
          auditModeRef.current = next;
          if (next) {
            // Starting audit: find current site in buckets to set position
            let found = false;
            for (let bi = 0; bi < buckets.length; bi++) {
              const si = buckets[bi].sources.findIndex((s) => s.url === currentUrl);
              if (si !== -1) {
                auditBucketIndex.current = bi;
                auditIndex.current = si;
                found = true;
                break;
              }
            }
            if (!found) {
              auditBucketIndex.current = 0;
              auditIndex.current = 0;
              const first = buckets[0]?.sources[0];
              if (first) {
                const site = { ...first, bucketId: buckets[0].id, bucketName: buckets[0].name };
                navigateTo(site);
              }
            }
            setAuditStats({ kept: 0, deleted: 0 });
          }
          return next;
        });
        return;
      }
      if (auditModeRef.current && (e.key === "k" || e.key === "K")) { auditKeepRef.current(); return; }
      if (auditModeRef.current && (e.key === "d" || e.key === "D")) { auditDeleteRef.current(); return; }
      if (e.key === "ArrowLeft") { navigateTo(prevSite, true); }
      else if (e.key === "ArrowRight") { navigateTo(nextSite); }
      else if (e.key === "ArrowUp") { e.preventDefault(); router.push("/"); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setShowFilterModal(true); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateTo, prevSite, nextSite, router, showFilterModal, currentUrl]);

  // Touch swipe navigation
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    function onTouchEnd(e: TouchEvent) {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx > 0) navigateTo(prevSite, true);
      else navigateTo(nextSite);
    }
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [navigateTo, prevSite, nextSite]);

  if (!currentUrl) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <LoadingSigil />
      </div>
    );
  }

  const iframeSrc = (useProxy || isBlocked) ? `/api/proxy?url=${encodeURIComponent(currentUrl)}` : currentUrl;
  const bucketColor = bucketColors[currentBucket] || "#E9F055";
  const bucketLabel = bucketLabels[currentBucket] || currentBucket;
  const siteTags = currentSite?.tags || [];
  const hasPrev = historyStack.current.length > 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Nav />

      {/* Site header bar */}
      <div className="relative flex items-center justify-between px-4 md:px-[60px] py-2 md:py-3">
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm" style={{ background: bucketColor }} />
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase" style={{ color: bucketColor }}>
              {bucketLabel}
            </span>
          </div>
          {activeFilters.size > 0 && (
            <>
              <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>|</span>
              <span className="text-[11px] tracking-[0.15em]" style={{ color: "var(--text-dim)" }}>
                {activeFilters.size} {activeFilters.size === 1 ? "filter" : "filters"}
              </span>
            </>
          )}
        </div>

        <motion.span
          key={currentName}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[family-name:var(--font-unbounded)] text-[18px] md:text-[22px] text-[var(--text-primary)] uppercase md:absolute md:left-1/2 md:-translate-x-1/2 truncate max-w-[200px] md:max-w-none"
        >
          {currentName}
        </motion.span>

        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2 text-[10px] md:text-[11px] font-semibold tracking-[0.2em] uppercase transition-all hover:bg-[rgba(233,240,85,0.08)] shrink-0 ml-3"
          style={{ border: "1px solid var(--border-gold)", color: "#E9F055" }}
        >
          Enter <span className="text-xs">→</span>
        </a>
      </div>

      {/* Iframe container */}
      <div className="flex-1 mx-0 md:mx-[60px] mb-0 relative overflow-hidden border border-[#2a2a2a] border-b-0 md:border-b">
        <div ref={iframeWrapRef} className="absolute inset-0" style={{ opacity: 0 }}>
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={() => { handleIframeLoad(); }}
            onError={() => {
              if (!useProxy) { setUseProxy(true); setLoading(true); }
              else { setIframeError(true); setLoading(false); }
            }}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Mobile swipe edge zones */}
        <div
          className="absolute top-0 left-0 bottom-0 w-[30px] z-10 md:hidden"
          onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={(e) => {
            if (!touchStart.current) return;
            const dx = e.changedTouches[0].clientX - touchStart.current.x;
            const dy = e.changedTouches[0].clientY - touchStart.current.y;
            touchStart.current = null;
            if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
            if (dx > 0) navigateTo(prevSite, true);
          }}
        />
        <div
          className="absolute top-0 right-0 bottom-0 w-[30px] z-10 md:hidden"
          onTouchStart={(e) => { touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={(e) => {
            if (!touchStart.current) return;
            const dx = e.changedTouches[0].clientX - touchStart.current.x;
            const dy = e.changedTouches[0].clientY - touchStart.current.y;
            touchStart.current = null;
            if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
            if (dx < 0) navigateTo(nextSite);
          }}
        />

        {/* TV curtains */}
        <div
          ref={curtainTopRef}
          className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
          style={{ height: "50%", background: "#0A0A0A" }}
        />
        <div
          ref={curtainBotRef}
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
          style={{ height: "50%", background: "#0A0A0A" }}
        />
        {/* Center flash line */}
        <div
          ref={scanLineRef}
          className="absolute left-0 right-0 z-25 pointer-events-none"
          style={{
            top: "50%",
            marginTop: "-1px",
            height: "2px",
            background: "#E9F055",
            boxShadow: "0 0 20px 6px rgba(233,240,85,0.6), 0 0 60px 15px rgba(233,240,85,0.3), 0 0 100px 30px rgba(233,240,85,0.1)",
            opacity: 0,
            transformOrigin: "center",
          }}
        />

        <div
          ref={overlayRef}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center"
          style={{ background: "var(--bg)" }}
        >
          {!iframeError && (
            <>
              <LoadingSigil />
              <span className="mt-6 text-[12px] tracking-[0.3em] uppercase" style={{ color: "var(--text-dim)" }}>
                Channeling {currentUrl ? new URL(currentUrl).hostname : "..."}
              </span>
            </>
          )}
        </div>

        {iframeError && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 md:gap-6 px-6" style={{ background: "var(--bg)" }}>
            <span className="font-[family-name:var(--font-unbounded)] text-[20px] md:text-[24px] text-[#E9F055] opacity-60 uppercase">Portal Warded</span>
            <span className="text-[12px] md:text-[13px] max-w-[300px] md:max-w-[400px] text-center leading-5 md:leading-6" style={{ color: "var(--text-muted)" }}>
              This sanctuary has protective wards against iframe embedding. Visit it directly to experience its design.
            </span>
            <a href={currentUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3 transition-all hover:bg-[rgba(233,240,85,0.08)]"
              style={{ border: "1px solid var(--border-gold)", color: "#E9F055" }}>
              <StarIcon size={12} />
              <span className="text-[11px] md:text-[12px] font-semibold tracking-[0.25em] uppercase">Visit {currentUrl ? new URL(currentUrl).hostname : "site"}</span>
            </a>
            <button onClick={seekRandom} className="text-[11px] tracking-[0.2em] uppercase cursor-pointer transition-colors hover:text-[#E9F055]" style={{ color: "var(--text-dim)" }}>
              or seek another portal →
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex flex-col items-center justify-center px-4 md:px-[60px] gap-2 md:gap-3 h-[180px] md:h-[140px] shrink-0 pb-[env(safe-area-inset-bottom)]">
        <div className="w-full h-px" style={{ background: "var(--border-subtle)" }} />

        {/* Mobile: compact row */}
        <div className="flex md:hidden items-center justify-between w-full py-2">
          <button
            onClick={() => navigateTo(prevSite, true)}
            className="flex items-center gap-2 group cursor-pointer min-h-[44px]"
          >
            <span className="text-xl text-[#E9F055]">←</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#E9F055]">Previous</span>
          </button>

          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 text-[10px] font-semibold tracking-[0.15em] uppercase cursor-pointer rounded-full transition-all duration-150 hover:brightness-110 min-h-[44px]"
            style={{ background: "#E9F055", color: "#0A0A0A" }}
          >
            Filter
            {activeFilters.size > 0 && (
              <span className="w-4 h-4 flex items-center justify-center text-[9px] rounded-full bg-[rgba(0,0,0,0.15)]">
                {activeFilters.size}
              </span>
            )}
          </button>

          <button onClick={() => navigateTo(nextSite)} className="flex items-center gap-2 group cursor-pointer min-h-[44px]">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#E9F055]">Next</span>
            <span className="text-xl text-[#E9F055]">→</span>
          </button>
        </div>

        {/* Desktop: full row */}
        <div className="hidden md:flex items-center justify-between w-full">
          <button
            onClick={() => navigateTo(prevSite, true)}
            className="flex items-center gap-3 w-[240px] group cursor-pointer text-left"
          >
            <span className="text-base transition-colors group-hover:text-white text-[#E9F055]">←</span>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#E9F055]">Previous</span>
              <span className="font-[family-name:var(--font-unbounded)] text-base uppercase transition-colors group-hover:text-white text-left line-clamp-2" style={{ color: "var(--text-muted)" }}>{prevSite.name}</span>
            </div>
          </button>
          <div className="flex gap-2.5 items-center">
            {siteTags.slice(0, 3).map((tag) => (
              <div key={tag} className="px-3.5 py-1.5 text-[10px] tracking-[0.15em] uppercase" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)" }}>{tag}</div>
            ))}
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-5 py-2 text-[10px] font-semibold tracking-[0.2em] uppercase cursor-pointer rounded-full transition-all duration-150 hover:brightness-110 hover:shadow-[0_0_20px_rgba(233,240,85,0.3)]"
              style={{ background: "#E9F055", color: "#0A0A0A" }}
            >
              Filter
              {activeFilters.size > 0 && (
                <span className="w-4 h-4 flex items-center justify-center text-[9px] rounded-full bg-[rgba(0,0,0,0.15)]">
                  {activeFilters.size}
                </span>
              )}
            </button>
          </div>
          <button onClick={() => navigateTo(nextSite)} className="flex items-center justify-end gap-3 w-[240px] group cursor-pointer">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#E9F055]">Next</span>
              <span className="font-[family-name:var(--font-unbounded)] text-base uppercase transition-colors group-hover:text-white line-clamp-2" style={{ color: "var(--text-muted)" }}>{nextSite.name}</span>
            </div>
            <span className="text-base transition-colors group-hover:text-white text-[#E9F055]">→</span>
          </button>
        </div>
      </div>

      {/* Filter modal */}
      <AnimatePresence>
        {showFilterModal && (
          <FilterModal
            activeFilters={activeFilters}
            onToggle={toggleFilter}
            onClose={() => setShowFilterModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Audit mode */}
      {auditMode && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
          <div
            className="flex items-center gap-4 px-6 py-3 rounded-full shadow-2xl"
            style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(233,240,85,0.3)" }}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: "#E9F055" }}>
              Audit
            </span>
            <span className="text-[10px] tracking-wide" style={{ color: "var(--text-muted)" }}>
              {bucketLabels[buckets[auditBucketIndex.current]?.id] || "—"}
            </span>
            <span className="text-[10px] tracking-wide" style={{ color: "var(--text-dim)" }}>
              {auditIndex.current + 1}/{buckets[auditBucketIndex.current]?.sources.length || 0}
            </span>
            <span className="text-[9px] tracking-wide" style={{ color: "var(--text-dim)" }}>
              ({auditStats.kept} kept / {auditStats.deleted} removed)
            </span>
            <div className="w-px h-4 bg-[rgba(255,255,255,0.1)]" />
            <button
              onClick={auditDelete}
              className="px-4 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase rounded-full transition-all hover:bg-[rgba(238,99,82,0.15)] cursor-pointer"
              style={{ border: "1px solid rgba(238,99,82,0.5)", color: "#EE6352" }}
            >
              Delete <span className="text-[9px] opacity-50 ml-1">D</span>
            </button>
            <button
              onClick={auditKeep}
              className="px-4 py-1.5 text-[11px] font-bold tracking-[0.15em] uppercase rounded-full transition-all hover:bg-[rgba(89,205,144,0.15)] cursor-pointer"
              style={{ border: "1px solid rgba(89,205,144,0.5)", color: "#59CD90" }}
            >
              Keep <span className="text-[9px] opacity-50 ml-1">K</span>
            </button>
            <div className="w-px h-4 bg-[rgba(255,255,255,0.1)]" />
            <button
              onClick={() => setAuditMode(false)}
              className="text-[10px] tracking-[0.1em] uppercase cursor-pointer transition-colors hover:text-white"
              style={{ color: "var(--text-dim)" }}
            >
              Exit <span className="text-[9px] opacity-50">A</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><LoadingSigil /></div>}>
      <ExploreContent />
    </Suspense>
  );
}

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

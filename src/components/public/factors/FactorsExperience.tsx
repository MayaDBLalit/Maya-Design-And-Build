"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { FACTOR_SCENE_ITEMS, FactorSceneItem } from "@/lib/factors-config";
import "./factors-hero.css";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface FiveFactorData {
  id: number;
  factorType: "space" | "air" | "fire" | "water" | "earth";
  titleEnglish: string;
  titleHindi: string;
  iconImage: string | null;
  tagline: string | null;
  detailsText: string | null;
  impactPoints: string[] | null;
  updatedAt: string | Date;
}

interface FactorsExperienceProps {
  factors: FiveFactorData[];
}

const PUBLIC_NAV_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Factors", href: "/factors" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Quotation", href: "/quotation" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const SCENE_WIDTH = 160;
const SCENE_HEIGHT = 90;
const EPSILON = 0.05;

export function FactorsExperience({ factors }: FactorsExperienceProps) {
  // 1. Initial active factor is strictly "water". No autoplay.
  const [activeId, setActiveId] = useState<"space" | "air" | "fire" | "water" | "earth">("water");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Synchronous derived map from factors prop (Fix #1: guarantees first-render data availability)
  const factorMap = useMemo(
    () => new Map(factors.map((f) => [f.factorType, f])),
    [factors]
  );

  // DOM Refs for animation loop
  const heroRef = useRef<HTMLElement>(null);
  const scRef = useRef<SVGSVGElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const hsRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Projection state refs (avoid React re-render thrashing during 60fps raf loop)
  const animState = useRef({
    cur: "water" as "space" | "air" | "fire" | "water" | "earth",
    vx: 0,
    tx: 0,
    vw: 160,
    initialized: false,
    rafId: 0,
  });

  const getFactorData = useCallback(
    (type: "space" | "air" | "fire" | "water" | "earth") => {
      const sceneItem = FACTOR_SCENE_ITEMS.find((x) => x.id === type) || FACTOR_SCENE_ITEMS[3];
      const dbItem = factorMap.get(type);

      return {
        id: type,
        en: dbItem?.titleEnglish || sceneItem.en,
        hi: dbItem?.titleHindi || sceneItem.hi,
        tagline: dbItem?.tagline || sceneItem.t,
        iconImage: dbItem?.iconImage || `/images/factors/${type}.svg`,
        detailsText: dbItem?.detailsText || "",
        impactPoints: dbItem?.impactPoints || [],
        scene: sceneItem,
      };
    },
    [factorMap]
  );

  const selectFactor = useCallback((id: "space" | "air" | "fire" | "water" | "earth") => {
    setActiveId(id);
    animState.current.cur = id;

    const u = FACTOR_SCENE_ITEMS.find((x) => x.id === id);
    if (u) {
      const vw = animState.current.vw;
      const maxPan = SCENE_WIDTH - vw;
      if (maxPan > 0) {
        animState.current.tx = Math.max(0, Math.min(maxPan, u.x - vw / 2));
      } else {
        animState.current.tx = 0;
      }
    }

    // Trigger card pop animation (using independent CSS scale property)
    if (cardRef.current) {
      cardRef.current.classList.remove("pop");
      void cardRef.current.offsetWidth;
      cardRef.current.classList.add("pop");
    }
  }, []);

  // Keyboard navigation across factors
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const order = FACTOR_SCENE_ITEMS.map((item) => item.id);
      const currentIndex = order.indexOf(activeId);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = order[(currentIndex + 1) % order.length];
        selectFactor(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = order[(currentIndex - 1 + order.length) % order.length];
        selectFactor(prev);
      }
    },
    [activeId, selectFactor]
  );

  // Mathematical Projection & Synchronization (Callable synchronously on mount & in 60FPS RAF)
  const updateScene = useCallback((isInitial = false) => {
    const hero = heroRef.current;
    const sc = scRef.current;
    const card = cardRef.current;
    const line = lineRef.current;
    const bar = barRef.current;
    if (!hero || !sc || !card || !line || !bar) return false;

    const winW = typeof window !== "undefined" ? window.innerWidth : 0;
    const winH = typeof window !== "undefined" ? window.innerHeight : 0;
    const heroW = hero.clientWidth || 0;
    let heroH = hero.clientHeight || 0;

    // Use hero dimensions if measured; clamp H by window.innerHeight so unstyled content flow never inflates H
    const W = heroW > 0 ? heroW : winW;
    if (winH > 0 && heroH > winH + 10) {
      heroH = winH;
    }
    const H = heroH > 0 ? heroH : winH;

    // Safe dimension validation: skip frame if container not measured yet (Fix #4: NaN prevention)
    if (W <= 0 || H <= 0 || !Number.isFinite(W) || !Number.isFinite(H)) {
      line.setAttribute("opacity", "0");
      return false;
    }

    const mq = window.matchMedia("(max-width: 767px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Geometry-driven scene visibility & cropping calculation (Fix #3)
    const visibleSceneWidth = Math.min(SCENE_WIDTH, (SCENE_HEIGHT * W) / H);
    const sceneIsHorizontallyCropped = visibleSceneWidth < SCENE_WIDTH - EPSILON;
    const vw = sceneIsHorizontallyCropped ? visibleSceneWidth : SCENE_WIDTH;
    animState.current.vw = vw;

    const activeItem =
      FACTOR_SCENE_ITEMS.find((x) => x.id === animState.current.cur) || FACTOR_SCENE_ITEMS[3];

    if (!sceneIsHorizontallyCropped) {
      // Complete 160x90 scene is visible: keep photograph completely fixed!
      animState.current.vx = 0;
      animState.current.tx = 0;
      animState.current.initialized = true;
    } else {
      // Scene is cropped: calculate target pan to center active factor in visible region
      const maxPan = SCENE_WIDTH - visibleSceneWidth;
      const targetX = Math.max(0, Math.min(maxPan, activeItem.x - visibleSceneWidth / 2));
      animState.current.tx = targetX;

      if (isInitial || !animState.current.initialized) {
        // Immediately center on Water on first render without jarring initial slide
        animState.current.vx = targetX;
        animState.current.initialized = true;
      } else {
        const diff = animState.current.tx - animState.current.vx;
        animState.current.vx += rm.matches ? diff : diff * 0.08;
      }
    }

    const vx = Number.isFinite(animState.current.vx) ? animState.current.vx : 0;
    sc.setAttribute("viewBox", `${vx.toFixed(2)} 0 ${vw.toFixed(2)} 90`);

    const s = Math.max(W / vw, H / SCENE_HEIGHT);
    const ox = (W - vw * s) / 2;
    const oy = (H - SCENE_HEIGHT * s) / 2;
    const project = (item: FactorSceneItem): [number, number] => [
      ox + (item.x - vx) * s,
      oy + item.y * s,
    ];

    // Update hotspot element positions (guaranteed finite coordinates)
    FACTOR_SCENE_ITEMS.forEach((item) => {
      const el = hsRefs.current[item.id];
      if (el) {
        const [p, q] = project(item);
        if (Number.isFinite(p) && Number.isFinite(q)) {
          el.style.transform = `translate(${p}px, ${q}px)`;
        }
        if (!el.classList.contains("ready")) {
          el.classList.add("ready");
        }
      }
    });

    // Update active card position and thin connector line
    const [px, py] = project(activeItem);
    const cw = card.offsetWidth;
    const ch2 = card.offsetHeight;
    const barH = bar.offsetHeight || 56;
    const isMob = mq.matches; // 767px breakpoint for UI layout (card at bottom vs near hotspot)

    let left = 0;
    let top = 0;
    let ly = 0;

    if (isMob) {
      left = 12;
      top = H - barH - 10 - ch2;
      ly = top;
    } else {
      left = Math.max(16, Math.min(W - cw - 16, px - cw / 2 + activeItem.sh));
      top = activeItem.s === "t" ? py - 46 - ch2 : py + 46;
      ly = activeItem.s === "t" ? top + ch2 : top;
    }

    // Fix #2: apply position transform first, then reveal card directly at hotspot
    if (Number.isFinite(left) && Number.isFinite(top)) {
      card.style.transform = `translate(${left}px, ${top}px)`;
      if (!card.classList.contains("show")) {
        card.classList.add("show");
      }
    }

    // Fix #4: connector coordinates with strict finite length validation
    const x1 = px;
    const y1 = py + (ly < py ? -7 : 7);
    const x2 = Math.max(left + 12, Math.min(left + Math.max(cw, 24) - 12, px));
    const y2 = ly;

    const coordsAreFinite =
      Number.isFinite(x1) &&
      Number.isFinite(y1) &&
      Number.isFinite(x2) &&
      Number.isFinite(y2) &&
      Number.isFinite(px) &&
      Number.isFinite(py);

    if (coordsAreFinite && cw > 0 && ch2 > 0) {
      const showLine = isMob ? py < top - 4 : true;
      line.setAttribute("x1", x1.toFixed(1));
      line.setAttribute("y1", y1.toFixed(1));
      line.setAttribute("x2", x2.toFixed(1));
      line.setAttribute("y2", y2.toFixed(1));
      line.setAttribute("opacity", showLine ? "0.9" : "0");
    } else {
      line.setAttribute("opacity", "0");
    }

    if (!sc.classList.contains("ready")) {
      sc.classList.add("ready");
    }

    return true;
  }, []);

  // Synchronous pre-paint initialization + 60FPS Mathematical Projection Loop
  useIsomorphicLayoutEffect(() => {
    // 1. Immediately compute & apply valid geometry before the browser paints the first frame
    updateScene(true);

    // 2. Start animation loop for smooth transitions, factor switching, and resizing
    const frame = () => {
      updateScene(false);
      animState.current.rafId = requestAnimationFrame(frame);
    };

    animState.current.rafId = requestAnimationFrame(frame);

    return () => {
      if (animState.current.rafId) {
        cancelAnimationFrame(animState.current.rafId);
      }
    };
  }, [updateScene]);

  // Synchronize drawer scroll lock & keyboard escape
  useEffect(() => {
    if (drawerOpen) {
      document.body.classList.add("factors-drawer-open");
    } else {
      document.body.classList.remove("factors-drawer-open");
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.body.classList.remove("factors-drawer-open");
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [drawerOpen]);

  // First-render activeData is immediately and synchronously complete from factorMap
  const activeData = getFactorData(activeId);

  return (
    <div className="factors-root" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* ===================================================================== */}
      {/* HERO SECTION (100svh IMMERSIVE VIEWPORT) */}
      {/* ===================================================================== */}
      <section
        ref={heroRef}
        className={`factors-hero ${activeId === "air" ? "air" : ""} ${
          activeId === "fire" ? "fire" : ""
        }`}
        id="hero"
        aria-label="Five elements"
        style={{
          position: "relative",
          height: "100svh",
          minHeight: 560,
          overflow: "hidden",
          background: "#2a1f14",
        }}
      >
        {/* 1. SCENE SVG: REAL PHOTOGRAPH BACKGROUND + SUN GLOW + AIR CURTAIN */}
        <svg
          ref={scRef}
          className="sc"
          id="sc"
          viewBox="0 0 160 90"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Courtyard with pool, tree, sheer curtains, sofa and sunlight"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <image
            href="/images/factors-background.jpg"
            x="0"
            y="0"
            width="160"
            height="90"
            preserveAspectRatio="none"
          />
          {/* Fire: Warm sunlight overlay */}
          <ellipse cx="84" cy="30" rx="16" ry="20" fill="#ffd27a" className="sun" />
          {/* Air: Aligned sheer curtain sway */}
          <g className="curt">
            <rect x="139" y="0" width="21" height="58" fill="#fff" opacity=".16" />
            <rect x="146" y="0" width="1" height="58" fill="#fff" opacity=".25" />
            <rect x="153" y="0" width="1" height="58" fill="#fff" opacity=".25" />
          </g>
        </svg>

        {/* 2. ATMOSPHERIC SHADE GRADIENT */}
        <div className="shade" />

        {/* 3. MOBILE HEADER: COMPACT LOGO + HAMBURGER (NO NORMAL DESKTOP NAVBAR) */}
        <Link href="/home" className="logo-m">
          MAYA
        </Link>
        <button
          className="burger"
          id="burger"
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="drawer"
          onClick={() => setDrawerOpen(true)}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        {/* 4. DESKTOP LEFT EDITORIAL CONTENT */}
        <div className="copy">
          <div className="eyebrow">Architecture rooted in nature</div>
          <div className="rule" />
          <h1>
            Five elements.
            <br />
            One living experience.
          </h1>

          {/* Dynamic database detailsText for selected factor (Synchronously populated on render #1) */}
          {activeData.detailsText && (
            <div className="lead details-lead">
              <p>{activeData.detailsText}</p>
            </div>
          )}

          {/* Dynamic database impactPoints as proper bullet points (Synchronously populated on render #1) */}
          {activeData.impactPoints && activeData.impactPoints.length > 0 && (
            <div className="impact-block">
              <div className="impact-heading">Spatial Impact</div>
              <ul className="impact-list">
                {activeData.impactPoints.map((point, index) => (
                  <li key={index} className="impact-item">
                    <span className="gold-dot" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Desktop-only static CTAs */}
          <div className="btns">
            <Link href="/projects" className="btn gold">
              Explore Projects
            </Link>
            <Link href="/home" className="btn">
              Discover MAYA
            </Link>
          </div>

          {/* Mobile instruction prompt */}
          <div className="m-only">Tap an element below to explore</div>
        </div>

        {/* 5. THIN GOLD CONNECTOR LINE (Zero NaN, opacity 0 until valid) */}
        <svg id="ln">
          <line ref={lineRef} id="l" x1="0" y1="0" x2="0" y2="0" opacity="0" />
        </svg>

        {/* 6. FLOATING FACTOR CARD (No transform collision, appears directly at hotspot) */}
        <div ref={cardRef} className="card pop" id="card" role="status">
          <div className="card-header">
            {activeData.iconImage && (
              <img
                src={activeData.iconImage}
                alt={activeData.en}
                className="card-icon"
              />
            )}
            <div className="c1">
              <span>{activeData.hi}</span> / {activeData.en.toUpperCase()}
            </div>
          </div>
          <div className="c2">{activeData.tagline}</div>
        </div>

        {/* 7. HOTSPOT HIT AREAS (ONLY ACTIVE FACTOR MARKER IS VISUALLY SHOWN) */}
        {FACTOR_SCENE_ITEMS.map((item) => {
          const isActive = item.id === activeId;
          const [width, height, radius, isGlow] = item.f;

          return (
            <div
              key={item.id}
              ref={(el) => {
                hsRefs.current[item.id] = el;
              }}
              className={`hs ${isActive ? "on" : ""}`}
            >
              {/* Factor-specific expanding ripple rings (active only) */}
              {isActive && (
                <>
                  {[0, 0.9, 1.8].map((delay, idx) => (
                    <b
                      key={idx}
                      className={`ring ${isGlow ? "glow" : ""}`}
                      style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        borderRadius: radius,
                        animationDelay: `${delay}s`,
                      }}
                    />
                  ))}
                </>
              )}

              {/* 60x60 transparent hit area button; inner dot <i> is visible ONLY when active */}
              <button
                type="button"
                className="hit"
                aria-label={`${item.en}: ${item.t}`}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") selectFactor(item.id);
                }}
                onFocus={() => selectFactor(item.id)}
                onClick={() => selectFactor(item.id)}
              >
                <i />
              </button>
            </div>
          );
        })}

        {/* 8. BOTTOM FACTOR NAVIGATION BAR */}
        <nav ref={barRef} className="bar" id="bar" aria-label="Five elements">
          {FACTOR_SCENE_ITEMS.map((item) => {
            const isActive = item.id === activeId;
            const data = getFactorData(item.id);

            return (
              <button
                key={item.id}
                type="button"
                className={isActive ? "on" : ""}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") selectFactor(item.id);
                }}
                onClick={() => selectFactor(item.id)}
              >
                <b>{data.hi}</b>
                <small>{data.en}</small>
              </button>
            );
          })}
        </nav>
      </section>

      {/* ===================================================================== */}
      {/* MOBILE BELOW SECTION (ACCESSIBLE VIA SCROLLING ON MOBILE) */}
      {/* ===================================================================== */}
      <section className="below" id="philosophy">
        {activeData.detailsText && (
          <div className="lead">
            <p>{activeData.detailsText}</p>
          </div>
        )}

        {activeData.impactPoints && activeData.impactPoints.length > 0 && (
          <div className="impact-block" style={{ marginTop: 20 }}>
            <div className="impact-heading">Spatial Impact</div>
            <ul className="impact-list">
              {activeData.impactPoints.map((point, index) => (
                <li key={index} className="impact-item">
                  <span className="gold-dot" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* ACCESSIBLE MOBILE DRAWER (USING ONLY SITE'S SHARED NAVIGATION LINKS) */}
      {/* ===================================================================== */}
      <div
        className="factors-drawer-ov"
        id="ov"
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className="factors-drawer"
        id="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div>
          <button
            type="button"
            className="x"
            id="xbtn"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
          <ul>
            {PUBLIC_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setDrawerOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="drawer-footer">
          <Link
            href="/quotation"
            className="drawer-action"
            onClick={() => setDrawerOpen(false)}
          >
            Estimate Project Cost
          </Link>
        </div>
      </aside>
    </div>
  );
}

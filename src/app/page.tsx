"use client";

import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import CountUp from "@/app/components/CountUp";
import {
  sectionVariants,
  heroChildVariants,
  heroStagger,
  staggerContainer,
  fadeUpItem,
  slideFromLeft,
  slideFromRight,
  scaleReveal,
  viewportOnce,
} from "@/lib/animations";

// Images served from /public/assets/
const bogBanner = "/assets/BOG_1280x360.png";
const mdeBanner = "/assets/MDE_1280x360.png";
const ctgBanner = "/assets/CTG_1280x360.png";
const heroBg = "/assets/bogota_background.jpg";
const mdeBg = "/assets/medellin_background.jpg";
const ctgBg = "/assets/cartagena_background.jpg";

const heroBgs = [heroBg, mdeBg, ctgBg];

const chapters = [
  { num: "01", title: "Airport arrival & transport" },
  { num: "02", title: "Climate & physical orientation" },
  { num: "03", title: "Street vendor & hustle navigation" },
  { num: "04", title: "Local language & codes" },
  { num: "05", title: "Nightlife & safe zones" },
  { num: "06", title: "Logistics & day trips" },
  { num: "07", title: "Food & health" },
  { num: "08", title: "Local mindset & cultural DNA" },
  { num: "09", title: "Emergencies & contacts" },
];

const cities = [
  {
    code: "BOG-72H",
    name: "Bogotá",
    tagline: '"No dar papaya"',
    price: "$17",
    accent: "bogota",
    banner: bogBanner,
    link: "https://megustacomco.gumroad.com/l/bogota72hours",
    available: true,
  },
  {
    code: "MDE-72H",
    name: "Medellín",
    tagline: '"The Mirage is real"',
    price: "$17",
    accent: "medellin",
    banner: mdeBanner,
    link: "https://megustacomco.gumroad.com/l/medellin-survival-vault",
    available: true,
  },
  {
    code: "CTG-72H",
    name: "Cartagena",
    tagline: '"Cógela Suave"',
    price: "$17",
    accent: "cartagena",
    banner: ctgBanner,
    link: "https://megustacomco.gumroad.com/l/cartagena-survival-vault",
    available: true,
  },
  {
    code: "CLO-72H",
    name: "Cali",
    tagline: "Coming soon",
    price: "",
    accent: "",
    banner: "",
    link: "",
    available: false,
  },
  {
    code: "SMR-72H",
    name: "Santa Marta",
    tagline: "Coming soon",
    price: "",
    accent: "",
    banner: "",
    link: "",
    available: false,
  },
  {
    code: "ADZ-72H",
    name: "San Andrés",
    tagline: "Coming soon",
    price: "",
    accent: "",
    banner: "",
    link: "",
    available: false,
  },
];

const faqs = [
  {
    q: "Is this a regular travel guide?",
    a: "No. This tells you how to survive — scam-free, stress-free. No fluff about the best Instagram spots.",
  },
  {
    q: "I already checked Reddit. Why pay?",
    a: "Reddit has fragments across 200 threads from 2019. This is curated, structured, and current.",
  },
  {
    q: "What format is it?",
    a: "Downloadable PDF. Read on your phone on the plane.",
  },
  {
    q: "Can I get a refund?",
    a: "Digital product, all sales final. At $17, it's less than a bad taxi ride.",
  },
  {
    q: "Who made this?",
    a: "Locals who watched tourists make the same mistakes for years.",
  },
];

const testimonials = [
  {
    name: "Jake R.",
    location: "Austin, TX",
    badge: "BOG-72H",
    badgeAccent: "bogota",
    quote:
      "A moto-taxi driver tried to charge me $40 from the airport. I already knew from the guide that the official taxi counter price was $8. Paid $8, kept $32. Guide paid for itself in literally 10 minutes.",
    keyResult: "Saved $32 in 10 minutes",
  },
  {
    name: "Sarah L.",
    location: "London, UK",
    badge: "MDE-72H",
    badgeAccent: "medellin",
    quote:
      "My friends who didn't read it ended up in the wrong neighborhood on night one and had to Uber back to Poblado. I went straight to the right zones — the nightlife chapter is worth the entire price.",
    keyResult: "Knew exactly where to go on night one",
  },
  {
    name: "Marcus W.",
    location: "Toronto, CA",
    badge: "CTG-72H",
    badgeAccent: "cartagena",
    quote:
      "Other tourists on my boat to Rosario paid 180,000 COP. I negotiated 95,000 because the guide told me the real price and the exact phrase to use. The vendor negotiation section alone is worth 10x the guide price.",
    keyResult: "Paid almost half what other tourists paid",
  },
  {
    name: "Emma K.",
    location: "Sydney, AU",
    badge: "BOG-72H",
    badgeAccent: "bogota",
    quote:
      "Downloaded it on the plane from Sydney. By the time I landed at El Dorado I felt like I'd already been there a week. No anxiety at immigration, no confusion with the SIM card, no taxi scam. Just ready.",
    keyResult: "Felt like I'd already been there",
  },
];

const badgeBgClass: Record<string, string> = {
  bogota: "bg-[#c0392b]/20 text-[#c0392b]",
  medellin: "bg-[#27ae60]/20 text-[#27ae60]",
  cartagena: "bg-[#2980b9]/20 text-[#2980b9]",
};

const accentBorderClass: Record<string, string> = {
  bogota: "border-[#c0392b]",
  medellin: "border-[#27ae60]",
  cartagena: "border-[#2980b9]",
};

const accentTextClass: Record<string, string> = {
  bogota: "text-[#c0392b]",
  medellin: "text-[#27ae60]",
  cartagena: "text-[#2980b9]",
};

const cityHoverShadow: Record<string, string> = {
  bogota: "0 0 20px rgba(192, 57, 43, 0.2)",
  medellin: "0 0 20px rgba(39, 174, 96, 0.2)",
  cartagena: "0 0 20px rgba(41, 128, 185, 0.2)",
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [showChevron, setShowChevron] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [leadError, setLeadError] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 300 && showChevron) setShowChevron(false);
    setShowBackToTop(latest > 600);
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBgIndex((i) => (i + 1) % 3), 4000);
    return () => clearInterval(id);
  }, []);

  const scrollToCity = () => {
    document.getElementById("cities")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail || !leadEmail.includes("@")) {
      setLeadError("Enter a valid email address");
      setLeadStatus("error");
      return;
    }
    setLeadStatus("loading");
    setLeadError("");
    try {
      const response = await fetch(
        "https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: leadEmail.trim() }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setLeadStatus("success");
      } else {
        setLeadError(
          data.error ||
            "Something went wrong. Try again or email hola@megusta.com.co"
        );
        setLeadStatus("error");
      }
    } catch {
      setLeadError(
        "Connection error. Try again or email hola@megusta.com.co"
      );
      setLeadStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          scrolled
            ? "bg-background/90 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-mono font-bold text-primary tracking-[0.25em] text-xs sm:text-sm">
            ME GUSTA COLOMBIA
          </span>
          <div className="flex items-center gap-4">
            <a
              href="#free-intel"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("free-intel")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="font-mono text-xs text-primary/70 hover:text-primary transition-colors tracking-wider hidden sm:inline"
            >
              FREE INTEL
            </a>
            <a
              href="#cities"
              onClick={(e) => {
                e.preventDefault();
                scrollToCity();
              }}
              className="font-mono text-xs text-primary hover:text-primary/80 transition-colors tracking-wider"
            >
              GET INTEL →
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {heroBgs.map((bg, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${bg})`,
              opacity: bgIndex === i ? 1 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.65)" }} />
        <motion.div
          className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center py-32"
          variants={heroStagger}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          style={{ willChange: "transform" }}
        >
          <motion.p
            variants={heroChildVariants}
            className="font-mono text-xs tracking-[0.3em] uppercase text-primary/60 mb-4"
          >
            For travelers who refuse to wing it
          </motion.p>
          <motion.p
            variants={heroChildVariants}
            className="font-mono text-xs sm:text-sm text-primary tracking-[0.3em] mb-6 uppercase"
          >
            Classified // First-Timer Protocol
          </motion.p>
          <motion.h1
            variants={heroChildVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
          >
            Tourists get scammed, overpay, and waste their first 3 days.
            <br className="sm:hidden" />{" "}
            <span className="text-primary">You won&apos;t.</span>
          </motion.h1>
          <motion.p
            variants={heroChildVariants}
            className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Every city has cheat codes the locals don&apos;t post online. We
            put them in a 72-hour tactical briefing — so you land prepared, not
            panicked.
          </motion.p>
          <motion.div
            variants={heroChildVariants}
            className="flex items-center justify-center gap-4 font-mono text-xs text-muted-foreground mb-4"
          >
            <span>
              <span className="text-foreground font-bold">
                <CountUp end={2847} suffix="+" />
              </span>{" "}
              briefed
            </span>
            <span className="text-border">|</span>
            <span>
              ⭐{" "}
              <span className="text-foreground font-bold">
                <CountUp end={4.9} decimals={1} />
              </span>{" "}
              avg rating
            </span>
            <span className="text-border">|</span>
            <span>
              <span className="text-foreground font-bold">
                <CountUp end={3} />
              </span>{" "}
              cities covered
            </span>
          </motion.div>
          <motion.p
            variants={heroChildVariants}
            className="italic text-sm text-muted-foreground mb-8"
          >
            Your flight is booked. The clock started.
          </motion.p>
          <motion.div
            variants={heroChildVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-4"
          >
            <Button
              size="lg"
              className="font-mono tracking-wider text-sm"
              onClick={scrollToCity}
            >
              GET YOUR CITY BRIEFING — $17
            </Button>
            <a
              href="https://megustacomco.gumroad.com/l/explorer-bundle"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg", className: "font-mono tracking-wider text-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground" })}
            >
              ALL 3 CITIES — $37 (SAVE 27%)
            </a>
          </motion.div>
          <motion.p
            variants={heroChildVariants}
            className="text-muted-foreground text-xs font-mono"
          >
            Takes 45 minutes to read. Covers your entire first 72 hours.
          </motion.p>
          {showChevron && (
            <motion.div
              className="mx-auto mt-16"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="mx-auto w-6 h-6 text-muted-foreground" />
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* GRADIENT DIVIDER */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* WHAT'S INSIDE */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={sectionVariants}
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewportOnce}
            style={{ willChange: "transform" }}
          >
            <p className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-3 text-center">
              What&apos;s Inside
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-12">
              9 chapters of local intel
            </h2>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={staggerContainer(0.06)}
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewportOnce}
          >
            {chapters.map((ch) => (
              <motion.div
                key={ch.num}
                variants={fadeUpItem(0.5)}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-colors"
                style={{ willChange: "transform" }}
              >
                <span className="font-mono text-primary text-sm font-bold">
                  {ch.num}
                </span>
                <p className="mt-2 font-semibold text-foreground">{ch.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* TESTIMONIALS */}
      <section className="py-20 sm:py-28 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={sectionVariants}
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewportOnce}
            style={{ willChange: "transform" }}
          >
            <p className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-3 text-center">
              Field Reports // Post-Landing Intel
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-12">
              They landed prepared. Here&apos;s what happened.
            </h2>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerContainer(0.1)}
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewportOnce}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUpItem(0.6)}
                className="bg-background border border-border rounded-lg p-6 border-l-[3px] border-l-primary hover:shadow-lg hover:shadow-primary/5 transition-all"
                style={{ willChange: "transform" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-xs px-2.5 py-0.5 rounded-full ${badgeBgClass[t.badgeAccent]}`}
                  >
                    {t.badge}
                  </span>
                  <span className="text-primary text-sm tracking-wide">
                    ★★★★★
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed italic mb-3">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="text-primary font-bold text-sm mb-4">
                  → {t.keyResult}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {t.name} · {t.location}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* LOSS AVERSION — IDENTITY SPLIT */}
      <section className="py-20 sm:py-28 bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={sectionVariants}
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewportOnce}
            style={{ willChange: "transform" }}
          >
            <p className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-3 text-center">
              INTEL COST ANALYSIS
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-12">
              Two types of travelers land in Colombia every day.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* LEFT: The Tourist */}
            <motion.div
              className="bg-background border border-border rounded-t-lg md:rounded-l-lg md:rounded-tr-none p-6 sm:p-8"
              variants={slideFromLeft}
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView="visible"
              viewport={viewportOnce}
              style={{ willChange: "transform" }}
            >
              <h3 className="font-mono text-sm text-muted-foreground tracking-[0.2em] uppercase mb-6">
                THE TOURIST
              </h3>
              <ul className="space-y-4">
                {[
                  "Pays $40 for a taxi that costs $8",
                  "Wastes 3 hours figuring out basics on day 1",
                  "Gets steered to overpriced restaurants by 'friendly' strangers",
                  "Ends up in the wrong neighborhood after dark",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#c0392b] font-bold text-sm mt-0.5">
                      ✕
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-[#c0392b]/80 font-mono">
                Total cost of not knowing: $100+ and a ruined first impression
              </p>
            </motion.div>

            {/* Mobile separator */}
            <div className="md:hidden border-t border-border" />

            {/* RIGHT: The Prepared Traveler */}
            <motion.div
              className="bg-background border border-border rounded-b-lg md:rounded-r-lg md:rounded-bl-none p-6 sm:p-8 border-l-0 md:border-l-[3px] md:border-l-primary"
              variants={slideFromRight}
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView="visible"
              viewport={viewportOnce}
              style={{ willChange: "transform" }}
            >
              <h3 className="font-mono text-sm text-primary tracking-[0.2em] uppercase mb-6">
                THE PREPARED TRAVELER
              </h3>
              <ul className="space-y-4">
                {[
                  "Takes the $8 official taxi — knows the exact counter location",
                  "Navigates like a local from hour one",
                  "Eats where locals eat at local prices",
                  "Knows exactly which zones are safe for nightlife",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-primary font-bold text-sm mt-0.5">
                      ✓
                    </span>
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-primary/80 font-mono">
                Cost of preparation: $17 — less than that overpriced taxi ride
              </p>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-12"
            variants={sectionVariants}
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewportOnce}
          >
            <a
              href="https://megustacomco.gumroad.com/l/colombia-arrival-cheat-sheet"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="text-base font-bold tracking-wide px-8"
              >
                BECOME THE PREPARED TRAVELER
              </Button>
            </a>
            <p className="font-mono text-xs text-muted-foreground mt-3">
              Instant PDF download. Read it on the plane.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* LEAD MAGNET */}
      <section id="free-intel" className="py-24 bg-card scroll-mt-16">
        <motion.div
          variants={sectionVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          style={{ willChange: "transform" }}
        >
          <div className="max-w-xl mx-auto px-6 text-center">
            <p className="font-mono text-xs text-primary/70 tracking-[0.3em] uppercase mb-3">
              FREE INTEL // ARRIVAL CHEAT SHEET
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
              Land in Colombia like you&apos;ve been before.
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Free 1-page PDF — airport hacks, taxi prices, first-day survival
              moves. No spam, just intel.
            </p>

            {leadStatus === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-primary text-2xl">✓</span>
                <p className="text-foreground font-semibold mt-2">
                  Check your inbox — intel incoming.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleLeadSubmit}>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={leadEmail}
                    onChange={(e) => {
                      setLeadEmail(e.target.value);
                      if (leadStatus === "error") setLeadStatus("idle");
                    }}
                    className="bg-[#0a0a0a] border-border"
                    disabled={leadStatus === "loading"}
                  />
                  <Button
                    type="submit"
                    className="font-mono tracking-wider whitespace-nowrap"
                    disabled={leadStatus === "loading"}
                  >
                    {leadStatus === "loading"
                      ? "Sending..."
                      : "Send Me the Cheat Sheet"}
                  </Button>
                </div>
                {leadStatus === "error" && (
                  <p className="text-xs text-destructive mt-3">{leadError}</p>
                )}
              </form>
            )}

            <p className="text-xs text-muted-foreground mt-6 font-mono">
              Join 2,847+ travelers who showed up prepared. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* CITY CARDS */}
      <section id="cities" className="py-20 sm:py-28 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={sectionVariants}
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewportOnce}
            style={{ willChange: "transform" }}
          >
            <p className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-3 text-center">
              Choose Your Briefing
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-12">
              City Survival Vaults
            </h2>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer(0.08)}
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewportOnce}
          >
            {cities.map((city) => (
              <motion.div
                key={city.code}
                variants={fadeUpItem(0.5)}
                className={`rounded-lg overflow-hidden border-2 transition-all ${
                  city.available
                    ? `${accentBorderClass[city.accent]} hover:scale-[1.02]`
                    : "border-border opacity-40 cursor-not-allowed"
                }`}
                whileHover={
                  city.available && !prefersReducedMotion
                    ? {
                        scale: 1.03,
                        boxShadow: cityHoverShadow[city.accent],
                      }
                    : undefined
                }
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ willChange: "transform" }}
              >
                {city.available && city.banner ? (
                  <div className="relative h-36 sm:h-40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={city.banner}
                      alt={`${city.name} survival guide`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <span className="font-mono text-xs text-primary tracking-wider">
                        {city.code}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-36 sm:h-40 bg-secondary flex items-center justify-center">
                    <span className="font-mono text-xs text-muted-foreground tracking-wider">
                      {city.code}
                    </span>
                  </div>
                )}
                <div className="p-5 bg-card">
                  <h3
                    className={`text-xl font-bold mb-1 ${
                      city.available
                        ? accentTextClass[city.accent]
                        : "text-muted-foreground"
                    }`}
                  >
                    {city.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    {city.tagline}
                  </p>
                  {city.available ? (
                    <a
                      href={city.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        className="w-full font-mono tracking-wider text-sm"
                        size="sm"
                      >
                        GET INTEL — {city.price}
                      </Button>
                    </a>
                  ) : (
                    <>
                      <Button
                        className="w-full font-mono tracking-wider text-sm"
                        size="sm"
                        disabled
                        variant="secondary"
                      >
                        COMING SOON
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        Want this city?{" "}
                        <a
                          href="#free-intel"
                          onClick={(e) => {
                            e.preventDefault();
                            document
                              .getElementById("free-intel")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-primary cursor-pointer hover:underline"
                        >
                          Let us know →
                        </a>
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* BUNDLE */}
      <section className="py-20 sm:py-28 bg-card">
        <motion.div
          className="max-w-2xl mx-auto px-4 sm:px-6 text-center"
          variants={sectionVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          style={{ willChange: "transform" }}
        >
          <p className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-3">
            Explorer Bundle
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
            3 cities. One download. Save 27%.
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-2xl text-muted-foreground line-through">
              $51
            </span>
            <motion.span
              className="text-5xl sm:text-6xl font-extrabold text-primary"
              variants={scaleReveal}
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView="visible"
              viewport={viewportOnce}
              style={{ willChange: "transform" }}
            >
              $37
            </motion.span>
          </div>
          <p className="text-muted-foreground text-sm mb-8">
            Bogotá + Medellín + Cartagena — everything you need before you land.
          </p>
          <a
            href="https://megustacomco.gumroad.com/l/explorer-bundle"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "lg", className: "font-mono tracking-wider text-sm px-10" })}
          >
            GET THE EXPLORER BUNDLE
          </a>
        </motion.div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={sectionVariants}
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={viewportOnce}
            style={{ willChange: "transform" }}
          >
            <p className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-3 text-center">
              Intel Briefing
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-12">
              Frequently Asked Questions
            </h2>
          </motion.div>
          <Accordion multiple={false} className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-5 bg-card"
              >
                <AccordionTrigger className="font-mono text-sm text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* FINAL CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-card to-background">
        <motion.div
          className="max-w-3xl mx-auto px-4 sm:px-6 text-center"
          variants={sectionVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          style={{ willChange: "transform" }}
        >
          <p className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-3">
            Final Briefing
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
            Still scrolling? Your trip is closer than you think.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8">
            Every traveler who bought this guide said the same thing: &ldquo;I
            wish I had this on my last trip.&rdquo; Don&apos;t be the one who
            says it after.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Button
              size="lg"
              className="font-mono tracking-wider text-sm"
              onClick={scrollToCity}
            >
              GET YOUR CITY FILE — $17
            </Button>
            <a
              href="https://megustacomco.gumroad.com/l/explorer-bundle"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg", className: "font-mono tracking-wider text-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground" })}
            >
              EXPLORER BUNDLE — $37
            </a>
          </div>
          <p className="text-muted-foreground text-xs font-mono">
            Join <CountUp end={2847} suffix="+" /> travelers who landed
            prepared, not panicked.
          </p>
        </motion.div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

      {/* FOOTER */}
      <motion.footer
        className="border-t border-border py-12"
        variants={sectionVariants}
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={viewportOnce}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="font-mono font-bold text-primary tracking-[0.25em] text-xs">
                ME GUSTA COLOMBIA
              </span>
              <p className="text-muted-foreground text-xs mt-1">
                <a
                  href="mailto:hola@megusta.com.co"
                  className="hover:text-primary transition-colors"
                >
                  hola@megusta.com.co
                </a>
              </p>
            </div>
            <div className="flex gap-6">
              {[
                {
                  name: "Pinterest",
                  url: "https://www.pinterest.com/megustacolombia",
                },
                { name: "Facebook", url: "https://facebook.com" },
                { name: "Instagram", url: "https://instagram.com" },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors tracking-wider"
                >
                  {s.name.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
          <p className="text-center text-muted-foreground text-xs mt-8">
            © {new Date().getFullYear()} Me Gusta Colombia. All rights reserved.
          </p>
        </div>
      </motion.footer>

      {/* BACK TO TOP */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Back to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

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
    q: "What do I actually get?",
    a: "The Arrival Cheat Sheet. One PDF: what a taxi from the airport costs, where to buy a SIM that works, which neighborhoods are fine after dark, what to do in your first 24 hours. No account, no card.",
  },
  {
    q: "How often will you email me?",
    a: "Ten emails over your first 25 days. That is the whole sequence.",
  },
  {
    q: "Is this bait for the paid guides?",
    a: "Partly. The cheat sheet is free and complete on its own. The city files are $17 and go deeper. Never buy one and the cheat sheet still works.",
  },
  {
    q: "Who is behind this?",
    // TODO(megusta): falta el dato real. El producto entero se apoya en "somos
    // locales" y esta respuesta es lo único que lo sostiene. Hace falta un nombre
    // que firme, o al menos cuántas fuentes son y en qué ciudades. Un colectivo
    // anónimo es una afirmación, no una prueba.
    a: "[FALTA: nombre real y una línea de por qué esta persona sabe de esto]",
  },
  {
    q: "What happens to my email?",
    a: "One list. We don't sell it or share it. Unsubscribe link in every email.",
  },
];

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
  const [emailFocused, setEmailFocused] = useState(false);
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
    // Pause background rotation while user is focused on the email input —
    // movement is a distraction during a conversion moment.
    if (emailFocused) return;
    const id = setInterval(() => setBgIndex((i) => (i + 1) % 3), 4000);
    return () => clearInterval(id);
  }, [emailFocused]);

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
    const eventId = crypto.randomUUID();
    try {
      const response = await fetch(
        "https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: leadEmail.trim(), event_id: eventId }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setLeadStatus("success");
        // Fire Meta Pixel Lead event only for genuinely new leads — firing on
        // every resubmit of an already-subscribed email inflates Meta's lead
        // count/CPL vs. real new contacts in Brevo.
        if (!data.isDuplicate && typeof window !== "undefined" && typeof (window as Window & { fbq?: (...args: unknown[]) => void }).fbq === "function") {
          (window as Window & { fbq?: (...args: unknown[]) => void }).fbq!("track", "Lead", { content_name: "Colombia Cheat Sheet", event_id: eventId });
        }
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
              // Los mapas callejeros reales de las tres ciudades son el activo menos
              // copiable de la página, y estaban apagados hasta ser textura: el propio
              // comentario decía "map stays as subtle texture". Subo saturación y brillo
              // para que se lean como mapas. El overlay de abajo bajó de 0.78 a 0.62.
              filter: "saturate(0.7) brightness(0.8) contrast(0.95)",
            }}
          />
        ))}
        {/* Strong uniform overlay — map stays as subtle texture */}
        <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.62)" }} />
        {/* Bottom-fade so content blends into page background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 50%, rgba(10,10,10,0.85) 100%)",
          }}
        />
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
            Walk into Colombia{" "}
            <span className="text-primary">like a local.</span>
          </motion.h1>
          <motion.p
            variants={heroChildVariants}
            className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Taxi prices that don't change when you say amigo. A SIM card in 5
            minutes. The neighborhoods locals actually live in. Free briefing.
          </motion.p>
          <motion.div
            variants={heroChildVariants}
            className="flex items-center justify-center gap-4 font-mono text-xs text-muted-foreground mb-4"
          >
            <span>
              <span className="text-foreground font-bold">
                <CountUp end={3} />
              </span>{" "}
              cities covered
            </span>
            <span className="text-border">|</span>
            <span>
              <span className="text-foreground font-bold">
                <CountUp end={90} suffix="+" />
              </span>{" "}
              pages of street-level intel
            </span>
            <span className="text-border">|</span>
            <span>
              Updated <span className="text-foreground font-bold">2026</span>
            </span>
          </motion.div>
          <motion.p
            variants={heroChildVariants}
            className="italic text-sm text-muted-foreground mb-8"
          >
            Your flight is booked. The clock started.
          </motion.p>

          {/* PRIMARY CTA: Lead magnet form with PDF preview */}
          <motion.div variants={heroChildVariants} className="mb-4">
            <p className="font-mono text-xs text-primary/80 tracking-[0.2em] uppercase mb-4 text-center">
              Free Briefing — Colombia Arrival Intel
            </p>

            {leadStatus === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center py-3 max-w-md mx-auto"
              >
                <span className="text-primary text-3xl">✓</span>
                <p className="text-foreground font-semibold mt-1">
                  Check your inbox — intel incoming.
                </p>
                <p className="text-xs text-white/50 mt-2 font-mono">
                  Look for a message from hola@megusta.com.co (check spam if needed)
                </p>
              </motion.div>
            ) : (
              <div className="flex items-stretch gap-4 max-w-md mx-auto">
                {/* Mini PDF preview thumbnail */}
                <div className="flex-shrink-0 w-16 sm:w-20 bg-[#1a1a1a] border border-white/10 rounded flex flex-col items-center justify-center py-2 px-1.5 shadow-lg">
                  <div className="w-full h-0.5 bg-primary mb-2" />
                  <p className="font-mono text-[7px] sm:text-[8px] text-primary tracking-[0.1em] uppercase text-center leading-tight">
                    Colombia<br/>Arrival
                  </p>
                  <p className="font-mono font-bold text-white text-[9px] sm:text-[10px] tracking-wider mt-1 text-center leading-tight">
                    INTEL<br/>BRIEF
                  </p>
                  <div className="my-1.5 w-6 h-px bg-primary/40" />
                  <ul className="text-[5px] sm:text-[6px] text-white/50 font-mono space-y-0.5 w-full px-1 leading-tight">
                    <li>→ Taxi $</li>
                    <li>→ Sim</li>
                    <li>→ Zones</li>
                    <li>→ Day 1</li>
                  </ul>
                  <p className="font-mono text-[6px] text-primary/60 tracking-widest mt-1">FREE</p>
                </div>

                {/* Form */}
                <form onSubmit={handleLeadSubmit} className="flex-1 flex flex-col gap-2">
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    aria-label="Your email address"
                    aria-invalid={leadStatus === "error"}
                    aria-describedby={leadStatus === "error" ? "lead-error-hero" : undefined}
                    placeholder="your@email.com"
                    value={leadEmail}
                    onChange={(e) => {
                      setLeadEmail(e.target.value);
                      if (leadStatus === "error") setLeadStatus("idle");
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary h-11"
                    disabled={leadStatus === "loading"}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="font-mono tracking-wider whitespace-nowrap text-sm w-full h-11"
                    disabled={leadStatus === "loading"}
                  >
                    {leadStatus === "loading" ? "Sending..." : "SKIP THE LEARNING CURVE →"}
                  </Button>
                </form>
              </div>
            )}

            {leadStatus === "error" && (
              <p id="lead-error-hero" role="alert" className="text-xs text-destructive mt-2 text-center">{leadError}</p>
            )}

            {/* Tranquilización: va DENTRO del bloque del formulario y no debajo del
                pliegue. Medido a 1280x720 el 11/08: el botón terminaba en 687px y
                esta línea caía en 742px, o sea el visitante veía el CTA y no veía la
                promesa de no-spam justo en el momento de mayor riesgo percibido.
                El contraste subió de white/45 (4,52:1, el mínimo justo de AA sobre un
                fondo que rota cada 4s) a white/70. */}
            {leadStatus !== "success" && (
              <p className="text-xs text-white/70 mt-3 text-center max-w-md mx-auto leading-relaxed">
                <span className="font-mono">62 people have it · No spam · Unsubscribe anytime</span>
              </p>
            )}
          </motion.div>
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

      {/* LEAD MAGNET — second touchpoint (mid-page) */}
      <section id="free-intel" className="py-20 bg-card scroll-mt-16">
        <motion.div
          variants={sectionVariants}
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={viewportOnce}
          style={{ willChange: "transform" }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* PDF preview mockup */}
              <div className="flex-shrink-0">
                <div className="w-40 h-56 bg-[#141414] border border-border rounded-lg flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                  <p className="font-mono text-primary text-[9px] tracking-[0.25em] uppercase mb-2 px-3 text-center">Colombia Arrival</p>
                  <p className="font-mono font-bold text-white text-sm tracking-wider px-3 text-center leading-tight">CHEAT<br/>SHEET</p>
                  <div className="my-3 w-12 h-px bg-primary/40" />
                  <ul className="text-[9px] text-muted-foreground font-mono space-y-1 px-4 w-full">
                    {["Airport hacks", "Taxi prices", "Sim card", "Safe zones", "Day-1 moves"].map(item => (
                      <li key={item} className="flex items-center gap-1.5">
                        <span className="text-primary text-[8px]">→</span>{item}
                      </li>
                    ))}
                  </ul>
                  <div className="absolute bottom-2">
                    <p className="font-mono text-[8px] text-primary/50 tracking-widest">FREE</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="flex-1 text-center md:text-left">
                <p className="font-mono text-xs text-primary/70 tracking-[0.3em] uppercase mb-3">
                  FREE INTEL // ARRIVAL CHEAT SHEET
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                  One page. Everything you need for day one.
                </h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  Airport taxi prices, SIM card spots, first-night safe zones, scam patterns to spot immediately. Read it on the plane.
                </p>

                {leadStatus === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="py-2"
                  >
                    <span className="text-primary text-2xl">✓</span>
                    <p className="text-foreground font-semibold mt-2">
                      Check your inbox — intel incoming.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleLeadSubmit}>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                      <Input
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        aria-label="Your email address"
                        aria-invalid={leadStatus === "error"}
                        aria-describedby={leadStatus === "error" ? "lead-error-mid" : undefined}
                        placeholder="your@email.com"
                        value={leadEmail}
                        onChange={(e) => {
                          setLeadEmail(e.target.value);
                          if (leadStatus === "error") setLeadStatus("idle");
                        }}
                        className="bg-background border-border"
                        disabled={leadStatus === "loading"}
                      />
                      <Button
                        type="submit"
                        className="font-mono tracking-wider whitespace-nowrap"
                        disabled={leadStatus === "loading"}
                      >
                        {leadStatus === "loading" ? "Sending..." : "Send Me the PDF"}
                      </Button>
                    </div>
                    {leadStatus === "error" && (
                      <p className="text-xs text-destructive mt-2">{leadError}</p>
                    )}
                  </form>
                )}

                <p className="text-xs text-muted-foreground mt-4 font-mono">
                  No spam. Unsubscribe anytime.
                </p>
              </div>
            </div>
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
          <p className="text-muted-foreground text-xs font-mono mt-4">
            If it doesn&apos;t save you at least what you paid, reply to your
            receipt and we refund it. No questions asked.
          </p>
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
            Read it on the plane. Land knowing the taxi price, the SIM card
            spot, and the neighborhoods that work. If it doesn&apos;t save you
            more than it costs, we refund it.
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
            No dar papaya, guaranteed: if it doesn&apos;t save you at least
            $17, you get your money back.
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
                // TODO(megusta): estos dos iban a los dominios pelados. Pulsabas
                // "INSTAGRAM" y llegabas a la portada de Instagram. En una página cuyo
                // problema central es la confianza, eso la resta gratis. Se ocultan
                // hasta que existan los perfiles; poner la URL real y devolverlos.
                { name: "Facebook", url: "https://facebook.com", hidden: true },
                { name: "Instagram", url: "https://instagram.com", hidden: true },
              ].filter((s) => !s.hidden).map((s) => (
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

      {/* STICKY MOBILE LEAD CAPTURE BAR */}
      {/* La condición era `showBackToTop && leadStatus !== "success"`: al enviar bien,
          la barra se desvanecía sin confirmar nada. Si estabas leyendo el FAQ, la
          interfaz se comía tu acción. Ahora en éxito se queda y confirma. */}
      <AnimatePresence>
        {showBackToTop && leadStatus === "success" && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 shadow-2xl"
          >
            <p role="status" className="text-sm text-center font-mono text-primary max-w-sm mx-auto">
              ✓ Check your inbox. Check spam if needed.
            </p>
          </motion.div>
        )}
        {showBackToTop && leadStatus !== "success" && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 shadow-2xl"
          >
            <form onSubmit={handleLeadSubmit} className="flex gap-2 max-w-sm mx-auto">
              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
                aria-label="Your email address"
                aria-invalid={leadStatus === "error"}
                aria-describedby={leadStatus === "error" ? "lead-error-sticky" : undefined}
                placeholder="Get free cheat sheet →"
                value={leadEmail}
                onChange={(e) => {
                  setLeadEmail(e.target.value);
                  if (leadStatus === "error") setLeadStatus("idle");
                }}
                className="bg-card border-border text-sm h-10"
                disabled={leadStatus === "loading"}
              />
              <Button
                type="submit"
                size="sm"
                className="font-mono text-xs whitespace-nowrap h-10 px-3"
                disabled={leadStatus === "loading"}
              >
                {leadStatus === "loading" ? "..." : "FREE →"}
              </Button>
            </form>
            {/* La barra fallaba en SILENCIO: handleLeadSubmit escribía leadError y el
                hero y el formulario de media página lo renderizaban, pero acá no había
                nada. En móvil, que es el punto de captura más alcanzable, pulsabas con
                un correo inválido y no pasaba nada visible. */}
            {leadStatus === "error" && (
              <p id="lead-error-sticky" role="alert" className="text-xs text-destructive mt-2 text-center max-w-sm mx-auto">
                {leadError}
              </p>
            )}
            {/* Y la tranquilización tampoco existía acá. */}
            {leadStatus !== "error" && (
              <p className="text-[11px] text-white/70 mt-2 text-center font-mono max-w-sm mx-auto">
                62 people have it · No spam
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

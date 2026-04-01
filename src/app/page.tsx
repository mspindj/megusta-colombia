const CITIES = [
  {
    name: "Bogotá",
    code: "BOG-72H",
    tagline: '"No dar papaya"',
    color: "text-red-accent",
    borderColor: "border-red-accent/30",
    url: "https://megustacomco.gumroad.com/l/bogota72hours",
    status: "live" as const,
  },
  {
    name: "Medellín",
    code: "MDE-72H",
    tagline: '"The Mirage is real"',
    color: "text-green-accent",
    borderColor: "border-green-accent/30",
    url: "https://megustacomco.gumroad.com/l/medellin-survival-vault",
    status: "live" as const,
  },
  {
    name: "Cartagena",
    code: "CTG-72H",
    tagline: '"Cógela Suave"',
    color: "text-blue-accent",
    borderColor: "border-blue-accent/30",
    url: "https://megustacomco.gumroad.com/l/cartagena-survival-vault",
    status: "live" as const,
  },
  {
    name: "Cali",
    code: "CLO-72H",
    tagline: "Coming soon",
    color: "text-text-muted",
    borderColor: "border-border",
    url: "#",
    status: "soon" as const,
  },
  {
    name: "Santa Marta",
    code: "SMR-72H",
    tagline: "Coming soon",
    color: "text-text-muted",
    borderColor: "border-border",
    url: "#",
    status: "soon" as const,
  },
  {
    name: "San Andrés",
    code: "ADZ-72H",
    tagline: "Coming soon",
    color: "text-text-muted",
    borderColor: "border-border",
    url: "#",
    status: "soon" as const,
  },
];

const CHAPTERS = [
  "Airport arrival & transport",
  "Climate & physical orientation",
  "Street vendor & hustle navigation",
  "Local language & codes",
  "Nightlife & safe zones",
  "Logistics & day trips",
  "Food & health",
  "Local mindset & cultural DNA",
  "Emergencies & contacts",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-dark/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-mono text-sm tracking-widest text-gold uppercase">
            Me Gusta Colombia
          </span>
          <a
            href="#cities"
            className="text-sm text-text-secondary hover:text-gold transition-colors"
          >
            Get Intel
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,168,67,0.06)_0%,_transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-gold-dim uppercase mb-6">
            Classified // First-Timer Protocol
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Your first 72 hours
            <br />
            <span className="text-gold">will make or break</span>
            <br />
            your trip to Colombia.
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed">
            Not a tourist guide. This is{" "}
            <span className="text-text-primary font-medium">
              tactical local intelligence
            </span>{" "}
            — the cheat codes that locals don&apos;t post on TripAdvisor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#cities"
              className="inline-flex items-center justify-center h-12 px-8 bg-gold text-black font-semibold rounded hover:bg-gold-light transition-colors"
            >
              Choose Your City
            </a>
            <a
              href="#bundle"
              className="inline-flex items-center justify-center h-12 px-8 border border-gold/30 text-gold font-medium rounded hover:bg-gold/10 transition-colors"
            >
              Explorer Bundle — $37
            </a>
          </div>
          <p className="mt-6 text-xs text-text-muted font-mono">
            Instant PDF download. No fluff. No affiliate spam.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-12 bg-gradient-to-b from-gold/50 to-transparent" />
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-[0.3em] text-gold-dim uppercase mb-4">
            Intel Structure // 9 Chapters
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What&apos;s inside each file
          </h2>
          <p className="text-text-secondary mb-12 max-w-lg">
            Every guide covers the same 9 tactical chapters, adapted with
            city-specific intel, prices, zones, and local codes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHAPTERS.map((chapter, i) => (
              <div
                key={chapter}
                className="flex items-start gap-3 p-4 rounded border border-border bg-bg-card"
              >
                <span className="font-mono text-xs text-gold-dim mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-text-primary">{chapter}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOSS AVERSION SECTION */}
      <section className="py-24 px-6 bg-bg-card border-y border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">
            What you <span className="text-red-accent">don&apos;t know</span>{" "}
            costs more than a guide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded border border-border bg-bg-dark">
              <p className="text-2xl font-bold text-red-accent mb-2">$40</p>
              <p className="text-sm text-text-secondary">
                What tourists pay for a taxi that should cost $8
              </p>
            </div>
            <div className="p-5 rounded border border-border bg-bg-dark">
              <p className="text-2xl font-bold text-red-accent mb-2">3 hrs</p>
              <p className="text-sm text-text-secondary">
                Average time lost on day 1 figuring out basics locals already
                know
              </p>
            </div>
            <div className="p-5 rounded border border-border bg-bg-dark">
              <p className="text-2xl font-bold text-gold mb-2">$17</p>
              <p className="text-sm text-text-secondary">
                The cost of knowing everything before you land — less than a
                lunch in Bogotá
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section id="cities" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-[0.3em] text-gold-dim uppercase mb-4">
            Select Target // City Files
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">
            Choose your city
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CITIES.map((city) => (
              <a
                key={city.code}
                href={city.url}
                target={city.status === "live" ? "_blank" : undefined}
                rel={city.status === "live" ? "noopener noreferrer" : undefined}
                className={`group block p-6 rounded border ${city.borderColor} bg-bg-card transition-colors ${
                  city.status === "live"
                    ? "hover:bg-bg-card-hover cursor-pointer"
                    : "opacity-50 cursor-default"
                }`}
              >
                <p className="font-mono text-xs text-text-muted mb-2">
                  {city.code}
                </p>
                <h3 className="text-xl font-bold mb-1">{city.name}</h3>
                <p className={`text-sm italic ${city.color}`}>
                  {city.tagline}
                </p>
                {city.status === "live" ? (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-gold">$17</span>
                    <span className="text-xs text-text-secondary group-hover:text-gold transition-colors">
                      Get Intel →
                    </span>
                  </div>
                ) : (
                  <div className="mt-4">
                    <span className="text-xs text-text-muted font-mono">
                      // PENDING DEPLOYMENT
                    </span>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* BUNDLE */}
      <section id="bundle" className="py-24 px-6 bg-bg-card border-y border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-gold-dim uppercase mb-4">
            Best Value // Explorer Bundle
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            3 cities. One download.{" "}
            <span className="text-gold">Save 27%.</span>
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Bogotá + Medellín + Cartagena — the complete survival intel for
            Colombia&apos;s top 3 destinations.
          </p>
          <div className="inline-flex flex-col items-center p-8 rounded border border-gold/30 bg-bg-dark">
            <p className="text-text-muted line-through text-lg mb-1">$51</p>
            <p className="text-4xl font-bold text-gold mb-2">$37</p>
            <p className="text-xs text-text-secondary mb-6">
              3 complete city files — instant download
            </p>
            <a
              href="https://megustacomco.gumroad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-12 px-10 bg-gold text-black font-semibold rounded hover:bg-gold-light transition-colors"
            >
              Get the Explorer Bundle
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-10">Common questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Is this a regular travel guide?",
                a: "No. Regular guides tell you what to see. This tells you how to survive — scam-free, stress-free, like a local briefed you before landing.",
              },
              {
                q: "I already checked Reddit. Why pay?",
                a: "Reddit has fragments scattered across 200 threads from 2019. This is curated, current, and structured for your first 72 hours — not a research project.",
              },
              {
                q: "What format is it?",
                a: "Downloadable PDF. Read it on your phone on the plane. No app, no internet needed.",
              },
              {
                q: "Can I get a refund?",
                a: "It's a digital product — all sales are final. But at $17, you're risking less than a bad taxi ride.",
              },
              {
                q: "Who made this?",
                a: "Locals who've watched tourists make the same mistakes for years. We built the guide we wish someone had given us to hand out.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-border pb-6">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm tracking-widest text-gold uppercase">
              Me Gusta Colombia
            </p>
            <p className="text-xs text-text-muted mt-1">
              hola@megusta.com.co
            </p>
          </div>
          <div className="flex gap-6 text-xs text-text-muted">
            <a
              href="https://www.pinterest.com/megustacolombia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              Pinterest
            </a>
            <a
              href="#"
              className="hover:text-gold transition-colors"
            >
              Facebook
            </a>
            <a
              href="#"
              className="hover:text-gold transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
        <p className="text-center text-xs text-text-muted mt-8">
          &copy; {new Date().getFullYear()} Me Gusta Colombia. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

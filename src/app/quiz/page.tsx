"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  QUESTIONS,
  PROFILES,
  CITY_GUIDES,
  scoreProfile,
  orderedMoves,
  type Answers,
  type CityId,
  type ProfileId,
} from "@/data/travelerQuiz";

type Fbq = (...args: unknown[]) => void;

function track(kind: "track" | "trackCustom", name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as Window & { fbq?: Fbq }).fbq;
  if (typeof fbq === "function") fbq(kind, name, params);
}

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [profileId, setProfileId] = useState<ProfileId | null>(null);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const question = QUESTIONS[step];

  const choose = (value: string) => {
    if (step === 0 && !answers.city) track("trackCustom", "QuizStart");
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }
    const result = scoreProfile(next);
    setProfileId(result);
    track("trackCustom", "QuizComplete", { profile: result, city: next.city });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setProfileId(null);
    setStatus("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Enter a valid email address");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    const eventId = crypto.randomUUID();
    try {
      const res = await fetch("https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          event_id: eventId,
          quiz: {
            profile: profileId,
            city: answers.city,
            length: answers.length,
            budget: answers.budget,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        if (!data.isDuplicate) {
          track("track", "Lead", { content_name: "Traveler Quiz", event_id: eventId });
        }
      } else {
        setError(data.error || "Something went wrong. Try again or email hola@megusta.com.co");
        setStatus("error");
      }
    } catch {
      setError("Connection error. Try again or email hola@megusta.com.co");
      setStatus("error");
    }
  };

  if (profileId) {
    const profile = PROFILES[profileId];
    const guide = CITY_GUIDES[(answers.city as CityId) ?? "several"];
    const longStay = answers.length === "month";

    return (
      <main className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] px-4 py-12 sm:py-16">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{profile.name}</h1>
          <p className="text-[#d4a843] text-lg mt-2">{profile.line}</p>
          <p className="text-[#c8c8c8] text-base leading-7 mt-6">{profile.description}</p>

          <h2 className="text-xl font-semibold mt-10">Your first moves</h2>
          <ul className="mt-4 space-y-3">
            {orderedMoves(profile, answers.city).map((m) => (
              <li key={m} className="flex gap-3 text-[#c8c8c8] leading-7">
                <Check className="size-5 shrink-0 mt-1 text-[#d4a843]" aria-hidden="true" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
          <p className="text-[#c8c8c8] leading-7 mt-6 border-t border-white/10 pt-6">{profile.habit}</p>

          {longStay && (
            <p className="text-[#c8c8c8] leading-7 mt-4">
              Staying a month or more changes the math. The frequent rider fares and a neighborhood you can walk start to matter more than any single sight.
            </p>
          )}

          <div className="mt-10 rounded-xl border border-white/10 bg-[#141414] p-6">
            {status === "success" ? (
              <div>
                <p className="font-semibold text-lg">Check your inbox.</p>
                <p className="text-[#a0a0a0] text-sm mt-2">
                  The arrival cheat sheet is on its way from hola@megusta.com.co. Check spam if it doesn&apos;t show up.
                </p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2 className="text-xl font-semibold">Get the free arrival cheat sheet</h2>
                <p className="text-[#a0a0a0] text-sm mt-2 leading-6">
                  Airport, SIM card, first taxi, first day. One page, built for the moment you land.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    aria-label="Your email address"
                    aria-invalid={status === "error"}
                    aria-describedby={status === "error" ? "quiz-error" : undefined}
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11"
                    disabled={status === "loading"}
                  />
                  <Button type="submit" size="lg" className="h-11 px-5" disabled={status === "loading"}>
                    {status === "loading" ? "Sending..." : "Send it"}
                  </Button>
                </div>
                {status === "error" && (
                  <p id="quiz-error" role="alert" className="text-sm text-red-400 mt-2">{error}</p>
                )}
                <p className="text-xs text-[#888] mt-3">No spam. Unsubscribe in one click.</p>
              </form>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-[#d4a843]/30 p-6">
            <h2 className="text-xl font-semibold">Want the whole city?</h2>
            <p className="text-[#a0a0a0] text-sm mt-2 leading-6">
              The {guide.label} covers transport, nights out, food, local codes and emergencies. If it doesn&apos;t save you at least what it costs, reply to your receipt and it&apos;s refunded.
            </p>
            <a
              href={guide.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("trackCustom", "QuizGuideClick", { profile: profileId, city: answers.city })}
              className="inline-flex items-center justify-center mt-4 h-11 px-5 rounded-lg bg-[#d4a843] text-black font-semibold hover:bg-[#e8c96a] transition-colors"
            >
              Get the {guide.label}: {guide.price}
            </a>
          </div>

          <button
            type="button"
            onClick={restart}
            className="mt-8 text-sm text-[#a0a0a0] underline underline-offset-4 hover:text-white"
          >
            Take the quiz again
          </button>
        </div>
      </main>
    );
  }

  const progress = Math.round((step / QUESTIONS.length) * 100);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] px-4 py-12 sm:py-16">
      <div className="max-w-xl mx-auto">
        {step === 0 && (
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">What kind of Colombia traveler are you?</h1>
            <p className="text-[#a0a0a0] mt-3 leading-7">
              Six questions, two minutes. You get your traveler profile and the first moves that fit how you travel.
            </p>
          </div>
        )}

        <div
          className="h-1 w-full rounded-full bg-white/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div className="h-full bg-[#d4a843] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <h2 className="text-2xl font-semibold mt-8">{question.question}</h2>
        <div className="mt-6 grid gap-3">
          {question.options.map((o) => {
            const selected = answers[question.id] === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => choose(o.value)}
                className={`text-left rounded-xl border px-5 py-4 text-base transition-colors ${
                  selected
                    ? "border-[#d4a843] bg-[#d4a843]/10"
                    : "border-white/10 bg-[#141414] hover:border-[#d4a843]/60 hover:bg-[#1a1a1a]"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="mt-6 inline-flex items-center gap-2 text-sm text-[#a0a0a0] hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </button>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: "hola@megusta.com.co",
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / marca */}
        <div className="text-center mb-8">
          <p className="text-[#d4a843] text-xs font-mono tracking-widest uppercase mb-2">
            Me Gusta Colombia
          </p>
          <h1 className="text-[#f5f5f5] text-2xl font-bold">Dashboard</h1>
          <p className="text-[#666666] text-sm mt-1">Solo para hola@megusta.com.co</p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          {sent ? (
            <div className="text-center">
              <div className="text-3xl mb-3">☕</div>
              <p className="text-[#f5f5f5] font-semibold mb-1">Revisa tu email</p>
              <p className="text-[#a0a0a0] text-sm">
                Enviamos el link de acceso a{" "}
                <span className="text-[#d4a843]">hola@megusta.com.co</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#a0a0a0] text-xs font-mono uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="text"
                  value="hola@megusta.com.co"
                  disabled
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3
                             text-[#666666] text-sm font-mono cursor-not-allowed"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4a843] text-black font-bold py-3 rounded-lg
                           hover:bg-[#e8c96a] transition-colors disabled:opacity-50
                           disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar magic link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

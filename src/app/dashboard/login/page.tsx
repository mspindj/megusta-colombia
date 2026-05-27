"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        setError(`ENV faltantes: URL=${!!url} KEY=${!!key}`);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { error, data } = await supabase.auth.signInWithPassword({
        email: "hola@megusta.com.co",
        password,
      });

      if (error) {
        setError(`Error: ${error.message}`);
        setLoading(false);
      } else if (data?.session) {
        window.location.href = "/dashboard";
      } else {
        setError("Sin sesión devuelta. Intentá de nuevo.");
        setLoading(false);
      }
    } catch (err) {
      setError(`Exception: ${String(err)}`);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[#d4a843] text-xs font-mono tracking-widest uppercase mb-2">
            Me Gusta Colombia
          </p>
          <h1 className="text-[#f5f5f5] text-2xl font-bold">Dashboard</h1>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
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

            <div>
              <label className="block text-[#a0a0a0] text-xs font-mono uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3
                           text-[#f5f5f5] text-sm placeholder:text-[#444444]
                           focus:outline-none focus:border-[#d4a843] transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-[#d4a843] text-black font-bold py-3 rounded-lg
                         hover:bg-[#e8c96a] transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

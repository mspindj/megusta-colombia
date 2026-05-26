import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "./actions";
import { IdeaRow } from "./IdeaRow";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/dashboard/login");

  const { data: ideas } = await supabase
    .from("content_ideas")
    .select("id, title, origin, score, url, status")
    .order("status", { ascending: true }) // pending primero
    .order("score", { ascending: false });

  const pending = ideas?.filter((i) => i.status === "pending") ?? [];
  const approved = ideas?.filter((i) => i.status === "approved") ?? [];
  const other = ideas?.filter((i) => !["pending", "approved"].includes(i.status)) ?? [];
  const sorted = [...pending, ...approved, ...other];

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[#d4a843] text-xs font-mono tracking-widest uppercase mb-1">
              Me Gusta Colombia
            </p>
            <h1 className="text-[#f5f5f5] text-2xl font-bold">Ideas de contenido</h1>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-[#666666] hover:text-[#a0a0a0] transition-colors font-mono"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Pendientes", count: pending.length, color: "text-[#a0a0a0]" },
            { label: "Aprobadas", count: approved.length, color: "text-[#d4a843]" },
            { label: "Total", count: ideas?.length ?? 0, color: "text-[#f5f5f5]" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 text-center"
            >
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>
                {stat.count}
              </p>
              <p className="text-[#666666] text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Instrucción */}
        <p className="text-[#666666] text-xs font-mono mb-4">
          Aprobar una idea → Haiku genera copy + imagen → entra al queue → se publica automáticamente
        </p>

        {/* Tabla */}
        {sorted.length === 0 ? (
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-12 text-center">
            <p className="text-[#666666] text-sm">Nada nuevo esta semana.</p>
            <p className="text-[#444444] text-xs mt-1">
              intel-gather corre cada lunes a las 8am.
            </p>
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left py-3 px-4 text-[#666666] text-xs font-mono uppercase tracking-wider">
                    Idea
                  </th>
                  <th className="text-center py-3 px-4 text-[#666666] text-xs font-mono uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-center py-3 px-4 text-[#666666] text-xs font-mono uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((idea) => (
                  <IdeaRow key={idea.id} idea={idea} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

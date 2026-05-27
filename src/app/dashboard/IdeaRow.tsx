"use client";

import { useState } from "react";
import { approveIdea, deleteIdea } from "./actions";

type Status = "pending" | "approved" | "in_progress" | "done";
type ContentType = "image" | "carousel" | "reel" | null;

interface Idea {
  id: string;
  title: string;
  origin: string;
  score: number;
  url: string | null;
  status: Status;
  content_type: ContentType;
  notes: string | null;
}

const STATUS_BADGE: Record<Status, string> = {
  pending: "bg-[#2a2a2a] text-[#a0a0a0]",
  approved: "bg-[#d4a843]/20 text-[#d4a843]",
  in_progress: "bg-blue-900/30 text-blue-400",
  done: "bg-green-900/30 text-green-400",
};

const STATUS_LABEL: Record<Status, string> = {
  pending: "pendiente",
  approved: "aprobada",
  in_progress: "en proceso",
  done: "publicada",
};

const TYPE_BADGE: Record<NonNullable<ContentType>, string> = {
  image: "bg-[#1a1a1a] text-[#888888] border border-[#2a2a2a]",
  carousel: "bg-purple-900/20 text-purple-300 border border-purple-900/40",
  reel: "bg-pink-900/20 text-pink-300 border border-pink-900/40",
};

export function IdeaRow({ idea }: { idea: Idea }) {
  const [loading, setLoading] = useState<"approve" | "delete" | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function handleApprove() {
    setLoading("approve");
    await approveIdea(idea.id);
    setLoading(null);
  }

  async function handleDelete() {
    setLoading("delete");
    await deleteIdea(idea.id);
    setLoading(null);
  }

  const isPending = idea.status === "pending";
  const hasNotes = !!idea.notes;

  return (
    <>
      <tr className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
        {/* Título */}
        <td className="py-4 px-4">
          <div className="flex items-start gap-2">
            {hasNotes ? (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 text-[#666666] hover:text-[#d4a843] transition-colors text-xs font-mono w-4 flex-shrink-0"
                aria-label={expanded ? "Colapsar notas" : "Expandir notas"}
              >
                {expanded ? "▾" : "▸"}
              </button>
            ) : (
              <span className="w-4 flex-shrink-0" />
            )}
            <div>
              {idea.url ? (
                <a
                  href={idea.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f5f5f5] text-sm hover:text-[#d4a843] transition-colors line-clamp-2"
                >
                  {idea.title}
                </a>
              ) : (
                <span className="text-[#f5f5f5] text-sm line-clamp-2">
                  {idea.title}
                </span>
              )}
              <p className="text-[#666666] text-xs mt-1 font-mono">{idea.origin}</p>
            </div>
          </div>
        </td>

        {/* Tipo */}
        <td className="py-4 px-4 text-center">
          {idea.content_type ? (
            <span
              className={`text-xs font-mono px-2 py-1 rounded-md ${TYPE_BADGE[idea.content_type]}`}
            >
              {idea.content_type}
            </span>
          ) : (
            <span className="text-[#444444] text-xs font-mono">—</span>
          )}
        </td>

        {/* Score */}
        <td className="py-4 px-4 text-center">
          <span className="text-[#d4a843] font-mono text-sm font-bold">
            {idea.score}
          </span>
        </td>

        {/* Status */}
        <td className="py-4 px-4 text-center">
          <span
            className={`text-xs font-mono px-2 py-1 rounded-full ${
              STATUS_BADGE[idea.status] ?? STATUS_BADGE.pending
            }`}
          >
            {STATUS_LABEL[idea.status] ?? idea.status}
          </span>
        </td>

        {/* Acciones */}
        <td className="py-4 px-4">
          <div className="flex gap-2 justify-end">
            {isPending && (
              <button
                onClick={handleApprove}
                disabled={loading !== null}
                className="text-xs bg-[#d4a843] text-black font-bold px-3 py-1.5 rounded-lg
                           hover:bg-[#e8c96a] transition-colors disabled:opacity-40"
              >
                {loading === "approve" ? "..." : "Aprobar"}
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={loading !== null}
              className="text-xs bg-[#2a2a2a] text-[#a0a0a0] font-bold px-3 py-1.5 rounded-lg
                         hover:bg-red-900/40 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              {loading === "delete" ? "..." : "Borrar"}
            </button>
          </div>
        </td>
      </tr>

      {/* Fila expandible con notes */}
      {expanded && hasNotes && (
        <tr className="border-b border-[#2a2a2a] bg-[#0f0f0f]">
          <td colSpan={5} className="py-3 px-4 pl-12">
            <p className="text-[#a0a0a0] text-xs leading-relaxed font-mono whitespace-pre-wrap">
              {idea.notes}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

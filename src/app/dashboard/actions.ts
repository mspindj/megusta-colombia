"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveIdea(id: string) {
  const supabase = await createClient();
  await supabase
    .from("content_ideas")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);

  // Dispara el pipeline idea-to-queue (Haiku + imagen + insert a content_queue).
  // La function es idempotente (si ya tiene generated_copy, salta).
  // No bloqueamos el UI: enviamos el request y abortamos si tarda más de 500ms
  // — Supabase ya recibió el body para entonces y procesa en su lado.
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/idea-to-queue`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea_id: id }),
      signal: AbortSignal.timeout(500),
    });
  } catch {
    // Timeout esperado — la function sigue procesando en Supabase
  }

  revalidatePath("/dashboard");
}

export async function deleteIdea(id: string) {
  const supabase = await createClient();
  await supabase.from("content_ideas").delete().eq("id", id);
  revalidatePath("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

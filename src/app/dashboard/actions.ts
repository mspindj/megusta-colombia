"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveIdea(id: string) {
  const supabase = await createClient();
  await supabase
    .from("content_ideas")
    .update({ status: "approved" })
    .eq("id", id);
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

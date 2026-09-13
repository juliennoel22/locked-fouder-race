import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf8");
let supabaseUrl = "";
let serviceRoleKey = "";

envFile.split("\n").forEach(line => {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) supabaseUrl = line.split("=")[1].trim();
  if (line.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) serviceRoleKey = line.split("=")[1].trim();
});

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function listAllUsers() {
  const { data: userData } = await supabase.auth.admin.listUsers();
  const { data: decksData } = await supabase.from("decks").select("id, user_id, title, created_at");

  const usersWithDecks = (userData?.users || []).map(u => {
    const userDecks = (decksData || []).filter(d => d.user_id === u.id);
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      is_pro: u.user_metadata?.is_pro === true,
      deck_count: userDecks.length,
      deck_titles: userDecks.map(d => d.title),
      metadata: u.user_metadata,
    };
  });

  console.log(JSON.stringify(usersWithDecks, null, 2));
  process.exit(0);
}

listAllUsers();

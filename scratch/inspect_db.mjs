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

async function inspect() {
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  const { data: decksData, error: decksError } = await supabase.from("decks").select("id, user_id, title, created_at");
  const { data: feedbackData, error: fbError } = await supabase.from("feedback").select("id, user_email, message, rating, created_at");

  console.log("=== USERS COUNT:", userData?.users?.length || 0);
  if (userData?.users) {
    userData.users.forEach((u, i) => {
      console.log(`[USER ${i+1}] ID: ${u.id} | Email: ${u.email} | Created: ${u.created_at} | LastSignIn: ${u.last_sign_in_at}`);
      console.log(`         Metadata:`, JSON.stringify(u.user_metadata));
    });
  }

  console.log("\n=== DECKS COUNT:", decksData?.length || 0);
  if (decksData) {
    decksData.forEach((d, i) => {
      console.log(`[DECK ${i+1}] ID: ${d.id} | Title: "${d.title}" | UserID: ${d.user_id} | Created: ${d.created_at}`);
    });
  }

  console.log("\n=== FEEDBACKS COUNT:", feedbackData?.length || 0);
  if (feedbackData) {
    feedbackData.forEach((f, i) => {
      console.log(`[FEEDBACK ${i+1}] ID: ${f.id} | Email: ${f.user_email} | Rating: ${f.rating} | Msg: "${f.message}" | Created: ${f.created_at}`);
    });
  }

  process.exit(0);
}

inspect();

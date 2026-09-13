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

const TEST_EMAILS_TO_DELETE = [
  "ghhh@ghh.gg",
  "etudiant.test@loreno.app",
  "ssc32302@laoia.com",
  "gvbbhjkknkugjh@gmail.com",
  "jeanjlkdqs@gmail.com",
  "jeanjaques@gmail.com",
  "jean@gmail.com",
  "bebe@gmail.com",
  "lidena6575@gmail.com",
  "jerome@gmail.com",
  "jeantram@gmail.com",
  "jen@gmail.com",
];

async function cleanup() {
  console.log("=== DÉBUT DU NETTOYAGE BASE DE DONNÉES ===");

  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error("Erreur récupération utilisateurs :", userError);
    process.exit(1);
  }

  const users = userData?.users || [];
  let deletedCount = 0;

  for (const email of TEST_EMAILS_TO_DELETE) {
    const matchedUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      console.log(`Suppression de l'utilisateur ${email} (ID: ${matchedUser.id})...`);
      const { error: delErr } = await supabase.auth.admin.deleteUser(matchedUser.id);
      if (delErr) {
        console.error(`Erreur suppression ${email} :`, delErr);
      } else {
        deletedCount++;
        console.log(`✓ ${email} supprimé avec succès.`);
      }
    } else {
      console.log(`- ${email} non trouvé (déjà supprimé ou inexistant).`);
    }
  }

  // Supprimer d'éventuels decks résiduels contenant "Aucune note de cours détectée"
  const { data: badDecks, error: badDecksErr } = await supabase
    .from("decks")
    .delete()
    .ilike("title", "%Aucune note de cours détectée%")
    .select("id, title");

  console.log("\n=== BILAN DU NETTOYAGE ===");
  console.log(`Utilisateurs de test supprimés : ${deletedCount} / ${TEST_EMAILS_TO_DELETE.length}`);
  if (badDecks && badDecks.length > 0) {
    console.log(`Decks invalides supprimés : ${badDecks.length}`);
  }

  // Vérification finale des utilisateurs restants
  const { data: remainingUsers } = await supabase.auth.admin.listUsers();
  const { data: remainingDecks } = await supabase.from("decks").select("id, title");

  console.log(`\nUtilisateurs restants (propres) : ${remainingUsers?.users?.length || 0}`);
  console.log(`Decks restants (propres) : ${remainingDecks?.length || 0}`);

  process.exit(0);
}

cleanup();

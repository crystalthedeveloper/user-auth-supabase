// /api/delete-account.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    // Handle CORS preflight
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).end();
    return;
  }

  if (req.method === "POST") {
    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Fetch user by email using Supabase Admin API
      const { data: users, error: fetchError } = await supabaseAdmin
        .from("users") // Supabase Auth table
        .select("id")
        .eq("email", email);

      if (fetchError || !users || users.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const userId = users[0].id;

      // Delete the user using Admin API
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        throw deleteError;
      }

      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error.message);
      res.status(500).json({ error: "Failed to delete account" });
    }
  } else {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
// /api/delete-account.js
import { createClient } from "@supabase/supabase-js";

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase Admin client
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export default async function handler(req, res) {
  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).end();
    return;
  }

  // Handle DELETE account request
  if (req.method === "POST") {
    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Fetch all users using Admin API to find matching email
      const { data: userList, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();

      if (fetchError) {
        console.error("Error fetching users:", fetchError.message);
        return res.status(500).json({ error: "Failed to fetch users" });
      }

      // Find user by email
      const user = userList.users.find((u) => u.email === email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete the user using Admin API
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error("Error deleting user:", deleteError.message);
        return res.status(500).json({ error: "Failed to delete user" });
      }

      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error handling request:", error.message);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  } else {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
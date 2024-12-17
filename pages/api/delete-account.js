// pages/api/delete-account.js
import { createClient } from "@supabase/supabase-js";

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("DEBUG: Starting /api/delete-account handler...");
console.log("SUPABASE_URL:", supabaseUrl || "SUPABASE_URL is undefined");
console.log("SUPABASE_SERVICE_ROLE_KEY Loaded:", serviceRoleKey ? "Yes" : "No");

// Initialize Supabase Admin client
let supabaseAdmin;
try {
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  console.log("DEBUG: Supabase Admin client initialized successfully.");
} catch (err) {
  console.error("ERROR: Failed to initialize Supabase client:", err.message);
}

export default async function handler(req, res) {
  console.log(`DEBUG: Incoming request method: ${req.method}`);

  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    console.log("DEBUG: Handling OPTIONS preflight request.");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).end();
    return;
  }

  if (req.method === "POST") {
    console.log("DEBUG: Handling POST request...");
    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
      const { email } = req.body;
      console.log("DEBUG: Request body received:", req.body);

      if (!email) {
        console.warn("WARNING: Email not provided in request body.");
        return res.status(400).json({ error: "Email is required" });
      }

      console.log(`DEBUG: Searching for user with email: ${email}`);

      // Fetch all users using Admin API
      const { data: userList, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();

      if (fetchError) {
        console.error("ERROR: Failed to fetch users:", fetchError.message);
        return res.status(500).json({ error: "Failed to fetch users" });
      }

      console.log("DEBUG: User list fetched successfully:", userList);

      // Find user by email
      const user = userList.users?.find((u) => u.email === email);
      if (!user) {
        console.warn(`WARNING: User with email ${email} not found.`);
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`DEBUG: User found. User ID: ${user.id}`);

      // Delete the user using Admin API
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error("ERROR: Failed to delete user:", deleteError.message);
        return res.status(500).json({ error: "Failed to delete user" });
      }

      console.log(`DEBUG: User with ID ${user.id} deleted successfully.`);
      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("ERROR: An unexpected error occurred:", error.message);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  } else {
    console.warn(`WARNING: Method ${req.method} not allowed.`);
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
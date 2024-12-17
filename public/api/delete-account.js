// /api/delete-account.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Fetch user by email
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers({
      email,
    });

    if (userError || !users?.users.length) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userId = users.users[0].id;

    // Delete user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({ message: 'User account deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
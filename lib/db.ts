import { createClient } from "@supabase/supabase-js"

// Utilisation de Supabase Database au lieu de Neon
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL environment variable is not set")
  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is required")
}

if (!supabaseServiceKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set")
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required")
}

// Client Supabase avec service role pour les opérations serveur
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Fonction helper pour exécuter des requêtes SQL
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const { data, error } = await supabaseAdmin.rpc("execute_sql", {
      query_text: query,
      query_params: params,
    })

    if (error) {
      console.error("Database query error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Database execution error:", error)
    throw error
  }
}

// Export du client admin pour les cas spéciaux
export { supabaseAdmin }

// Fonction de test de connexion
export async function testConnection() {
  try {
    const { data, error } = await supabaseAdmin.from("funnels").select("count").limit(1)

    if (error) {
      console.error("❌ Database connection failed:", error)
      return false
    }

    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

export default supabaseAdmin

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/dashboard-client"
import type { Funnel, Quiz } from "@/lib/types"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Récupérer les funnels de l'utilisateur
  const { data: funnels } = await supabase
    .from("funnels")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  // Récupérer les quiz de l'utilisateur
  const { data: quiz } = await supabase
    .from("quiz")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  // Récupérer les statistiques
  const { data: funnelSubmissions } = await supabase.from("submissions").select("id").not("funnel_id", "is", null)

  const { data: quizSubmissions } = await supabase.from("submissions").select("id").not("quiz_id", "is", null)

  const stats = {
    funnel_submissions: funnelSubmissions?.length || 0,
    quiz_submissions: quizSubmissions?.length || 0,
    total_submissions: (funnelSubmissions?.length || 0) + (quizSubmissions?.length || 0),
  }

  return (
    <DashboardClient user={user} funnels={(funnels as Funnel[]) || []} quiz={(quiz as Quiz[]) || []} stats={stats} />
  )
}

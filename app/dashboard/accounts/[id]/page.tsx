import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AccountDetails } from "@/components/dashboard/account-details"

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Handle cookie setting errors
          }
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: account } = await supabase.from("accounts").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!account) {
    redirect("/dashboard")
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", id)
    .order("transaction_date", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto py-8 px-4">
        <AccountDetails account={account} transactions={transactions || []} />
      </main>
    </div>
  )
}

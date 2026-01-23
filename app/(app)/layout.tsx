import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Get user data for usage display
  const { data: userData } = await supabase
    .from("users")
    .select("plan, conversions_used_this_month")
    .eq("id", user.id)
    .single();

  const planLimits: Record<string, number> = {
    free: 2,
    starter: 10,
    pro: 30,
  };

  const limit = userData ? planLimits[userData.plan] || 2 : 2;
  const used = userData?.conversions_used_this_month || 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        userEmail={user.email || ""}
        conversionsUsed={used}
        conversionsLimit={limit}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

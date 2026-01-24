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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Saltar al contenido principal
      </a>
      <AppHeader
        userEmail={user.email || ""}
        conversionsUsed={used}
        conversionsLimit={limit}
      />
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

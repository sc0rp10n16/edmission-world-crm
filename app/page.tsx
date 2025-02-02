import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-4 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Add your logo here */}
          <span className="text-xl font-bold">CRM System</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Welcome to Our CRM System
            </h1>
            <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Manage your educational institution efficiently with our comprehensive CRM solution
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/login">
                <Button className="min-w-[140px]">
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  className="min-w-[140px]"
                >
                  Register
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container grid items-center gap-4 px-4 text-center md:px-6 lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Features
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Discover what our CRM can do for your institution
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold">Lead Management</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Efficiently track and manage student leads
                </p>
              </div>
              <div className="flex flex-col gap-2 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold">Task Assignment</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Streamline workflow with automated task assignments
                </p>
              </div>
              <div className="flex flex-col gap-2 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold">Progress Tracking</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Monitor student progress and team performance
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col gap-2 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 CRM System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
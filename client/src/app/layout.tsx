import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import InstallPrompt from "@/components/InstallPrompt"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FoodFinder - Discover Great Restaurants",
  description: "Find and explore the best restaurants in your area",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6"/>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
              <Header />
              <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
              <Footer />
              <Toaster position="top-center" richColors />
              <InstallPrompt/>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
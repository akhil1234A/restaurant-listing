"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, User, Utensils } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    { href: "/", label: "Home", active: pathname === "/" },
    ...(isAuthenticated ? [{ href: "/restaurants", label: "Restaurants", active: pathname.startsWith("/restaurants") }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: Logo and Navigation */}
        <div className="flex items-center gap-6 md:gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Utensils className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">FoodFinder</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-500 dark:hover:text-blue-400",
                  route.active ? "text-blue-500 dark:text-blue-400 font-semibold" : "text-gray-700 dark:text-gray-200"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section: Auth Actions */}
        <div className="flex items-center gap-3">
          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-blue-500/20 hover:bg-blue-500/10 text-gray-700 dark:text-gray-200 dark:border-blue-400/20 dark:hover:bg-blue-400/10"
                >
                  <Link href="/add-restaurant">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Restaurant
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-blue-500/10 dark:hover:bg-blue-400/10"
                    >
                      <User className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DropdownMenuItem className="font-medium text-gray-900 dark:text-gray-100">
                      {user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-400 dark:text-white dark:hover:bg-blue-500"
                >
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Utensils className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">FoodFinder</span>
              </div>
              <nav className="flex flex-col gap-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-base font-medium transition-colors hover:text-blue-500 dark:hover:text-blue-400",
                      route.active ? "text-blue-500 dark:text-blue-400 font-semibold" : "text-gray-700 dark:text-gray-200"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/add-restaurant"
                      className="text-base font-medium transition-colors hover:text-blue-500 dark:hover:text-blue-400 text-gray-700 dark:text-gray-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Add Restaurant
                    </Link>
                    <Button
                      variant="ghost"
                      className="justify-start p-0 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-base font-medium transition-colors hover:text-blue-500 dark:hover:text-blue-400 text-gray-700 dark:text-gray-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="text-base font-medium transition-colors hover:text-blue-500 dark:hover:text-blue-400 text-gray-700 dark:text-gray-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
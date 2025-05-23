"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, User, Plus } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">FoodFinder</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden md:flex md:items-center md:gap-4">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/add-restaurant">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Restaurant
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-medium">{user?.email}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-muted-foreground",
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
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Add Restaurant
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start p-0 text-sm font-medium"
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
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium transition-colors hover:text-primary"
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
    </header>
  )
}

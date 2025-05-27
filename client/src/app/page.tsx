"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Utensils } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Utensils className="h-12 w-12 mx-auto mb-4 text-blue-500 dark:text-blue-400" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Welcome to FoodFinder
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            FoodFinder is your go-to platform for discovering the best restaurants in your area. Explore a variety of cuisines, read reviews, and find your next favorite dining spot. Join our community to save your favorite restaurants and share your experiences!
          </p>
          <div className="flex justify-center gap-4">
            {isAuthenticated ? (
              <Button
                asChild
                size="lg"
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Link href="/restaurants">Browse Restaurants</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Link href="/login">Login to Browse Restaurants</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900"
                >
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
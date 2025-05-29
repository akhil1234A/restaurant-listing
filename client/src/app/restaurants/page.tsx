"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"
import { getRestaurants } from "@/lib/api"
import type { Restaurant } from "@/lib/types"
import RestaurantCard from "@/components/restaurant-card"
import Pagination from "@/components/pagination"

// Component to handle search params and routing
function SearchContent({
  setSearchQuery,
  setPagination,
}: {
  setSearchQuery: (query: string) => void
  setPagination: React.Dispatch<
    React.SetStateAction<{
      page: number
      limit: number
      total: number
      totalPages: number
    }>
  >
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pageParam = searchParams.get("page")
  const searchParam = searchParams.get("search")

  useEffect(() => {
    const page = pageParam ? Number.parseInt(pageParam) : 1
    setSearchQuery(searchParam || "")
    setPagination((prev) => ({ ...prev, page }))

    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) params.set("page", page.toString())
    else params.delete("page") // Remove page param if page is 1 for cleaner URL
    if (searchParam) params.set("search", searchParam)
    else params.delete("search") // Remove search param if empty
    const url = params.toString() ? `/restaurants?${params.toString()}` : "/restaurants"
    router.push(url, { scroll: false })
  }, [pageParam, searchParam, router, setSearchQuery, setPagination])

  return null
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)

  const fetchRestaurants = useCallback(async (page: number, search: string) => {
    setIsLoading(true)
    try {
      const data = await getRestaurants(page, 3, search)
      setRestaurants(data.restaurants)
      setPagination((prev) => ({ ...prev, total: data.pagination.total, totalPages: data.pagination.totalPages }))
    } catch (error) {
      const err = error as Error
      toast.error(err.message || "Failed to fetch restaurants")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRestaurants(pagination.page, debouncedSearch)
  }, [pagination.page, debouncedSearch, fetchRestaurants])

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <div className="container py-8">
        <Suspense fallback={<div>Loading search parameters...</div>}>
          <SearchContent setSearchQuery={setSearchQuery} setPagination={setPagination} />
        </Suspense>
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Discover Restaurants</h1>
          <p className="text-muted-foreground">Find the best restaurants in your area</p>
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search restaurants, cuisines, or locations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="rounded-lg border bg-card shadow">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
          </div>
        ) : restaurants.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium">No restaurants found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Clock, MapPin, Phone, Globe, Truck, UtensilsCrossed, ShoppingBag, Pencil, Trash2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { getRestaurantById, deleteRestaurant } from "@/lib/api"
import type { Restaurant } from "@/lib/types"
import RestaurantMap from "@/components/restaurant-map"

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchRestaurant = async () => {
      setIsLoading(true)
      try {
        const data = await getRestaurantById(id as string)
        setRestaurant(data.restaurant)
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch restaurant details")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurant()
  }, [id, router])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this restaurant?")) return

    setIsDeleting(true)
    try {
      await deleteRestaurant(id as string)
      toast.success("Restaurant deleted successfully")
      router.push("/")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete restaurant")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) return null

  const isOwner = isAuthenticated && user?.id === restaurant.userId

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src={restaurant.images[activeImageIndex] || "/placeholder.svg?height=480&width=640"}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {restaurant.images.slice(0, 3).map((image, index) => (
              <button
                key={index}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                  activeImageIndex === index ? "border-primary" : "border-transparent"
                }`}
                onClick={() => setActiveImageIndex(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${restaurant.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              {isOwner && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/edit-restaurant/${restaurant._id}`}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {restaurant.categories.map((category, index) => (
                <Badge key={index} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {restaurant.description && <p className="text-muted-foreground">{restaurant.description}</p>}

          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
              <div>
                <p>{restaurant.address}</p>
                <p>
                  {restaurant.city}, {restaurant.pinCode}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
              <p>
                {restaurant.openingTime} - {restaurant.closingTime}
              </p>
            </div>
            <div className="flex items-center">
              <Phone className="mr-2 h-5 w-5 text-muted-foreground" />
              <p>{restaurant.phoneNumber}</p>
            </div>
            {restaurant.website && (
              <div className="flex items-center">
                <Globe className="mr-2 h-5 w-5 text-muted-foreground" />
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {restaurant.website}
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {restaurant.offersDelivery && (
              <div className="flex items-center">
                <Truck className="mr-1.5 h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Delivery</span>
              </div>
            )}
            {restaurant.offersDineIn && (
              <div className="flex items-center">
                <UtensilsCrossed className="mr-1.5 h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Dine-in</span>
              </div>
            )}
            {restaurant.offersPickup && (
              <div className="flex items-center">
                <ShoppingBag className="mr-1.5 h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Pickup</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-bold">Location</h2>
        <div className="h-[400px] w-full overflow-hidden rounded-lg border">
          <RestaurantMap latitude={restaurant.latitude} longitude={restaurant.longitude} name={restaurant.name} />
        </div>
      </div>
    </div>
  )
}

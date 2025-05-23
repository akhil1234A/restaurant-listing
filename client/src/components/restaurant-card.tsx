import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin } from "lucide-react"
import type { Restaurant } from "@/lib/types"

interface RestaurantCardProps {
  restaurant: Restaurant
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant._id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="relative h-48 w-full">
          <Image
            src={restaurant.images[0] || "/placeholder.svg?height=192&width=384"}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="text-xl font-bold">{restaurant.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1">
            {restaurant.categories.slice(0, 3).map((category, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
            {restaurant.categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{restaurant.categories.length - 3}
              </Badge>
            )}
          </div>
          <div className="mt-3 flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-3.5 w-3.5" />
            <span className="truncate">{restaurant.city}</span>
          </div>
          <div className="mt-1 flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>
              {restaurant.openingTime} - {restaurant.closingTime}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4 pt-3">
          <div className="flex space-x-4 text-sm">
            {restaurant.offersDelivery && <span className="text-green-600">Delivery</span>}
            {restaurant.offersDineIn && <span className="text-blue-600">Dine-in</span>}
            {restaurant.offersPickup && <span className="text-orange-600">Pickup</span>}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

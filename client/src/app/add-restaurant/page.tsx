"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { restaurantSchema, type RestaurantFormData } from "@/lib/types"
import { createRestaurant } from "@/lib/api"
import RestaurantLocationPicker from "@/components/restaurant-location-picker"

export default function AddRestaurantPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)

  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      pinCode: "",
      categories: JSON.stringify(["Restaurant"]),
      description: "",
      website: "",
      phoneNumber: "",
      openingTime: "09:00",
      closingTime: "22:00",
      offersDelivery: false,
      offersDineIn: true,
      offersPickup: false,
    },
  })

  const onSubmit = async (data: RestaurantFormData) => {
    if (!coordinates) {
      toast.error("Please select a location on the map")
      return
    }

    if (selectedImages.length < 3) {
      toast.error("Please upload at least 3 images")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Add all text fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "categories") {
          // Categories is already a JSON string from the form
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      })

      // Add coordinates
      formData.append("latitude", String(coordinates.lat))
      formData.append("longitude", String(coordinates.lng))

      // Add images
      selectedImages.forEach((image) => {
        formData.append("images", image)
      })

      await createRestaurant(formData)
      toast.success("Restaurant added successfully")
      router.push("/")
    } catch (error: any) {
      toast.error(error.message || "Failed to add restaurant")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      setSelectedImages(fileArray)
    }
  }

  return (
    <div className="container py-8">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Restaurant</CardTitle>
          <CardDescription>Fill in the details to add a new restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Restaurant Name"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.trim())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories</FormLabel>
                      <FormControl>
                        <Input placeholder='["Italian", "Pizza"]' {...field} />
                      </FormControl>
                      <FormDescription>Enter as JSON array (e.g. ["Italian", "Pizza"])</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the restaurant" className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main St"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.trim())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="New York"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.trim())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="pinCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pin Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} onChange={(e) => field.onChange(e.target.value.trim())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234567890"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.trim())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.trim())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="openingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time</FormLabel>
                      <FormControl>
                        <Input placeholder="09:00" {...field} onChange={(e) => field.onChange(e.target.value.trim())} />
                      </FormControl>
                      <FormDescription>Format: HH:MM (24-hour)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="closingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Time</FormLabel>
                      <FormControl>
                        <Input placeholder="22:00" {...field} onChange={(e) => field.onChange(e.target.value.trim())} />
                      </FormControl>
                      <FormDescription>Format: HH:MM (24-hour)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Services Offered</FormLabel>
                <div className="grid gap-2 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="offersDelivery"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Delivery</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="offersDineIn"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Dine-in</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="offersPickup"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Pickup</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Restaurant Images</FormLabel>
                <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
                <FormDescription>Upload at least 3 images (max 10MB each)</FormDescription>
                {selectedImages.length > 0 && <div className="text-sm">{selectedImages.length} image(s) selected</div>}
              </div>

              <div className="space-y-2">
                <FormLabel>Location</FormLabel>
                <FormDescription>Click on the map to set the restaurant location</FormDescription>
                <div className="h-[300px] w-full overflow-hidden rounded-md border">
                  <RestaurantLocationPicker onLocationSelect={setCoordinates} />
                </div>
                {coordinates && (
                  <div className="text-sm">
                    Selected location: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </div>
                )}
              </div> 

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Adding Restaurant..." : "Add Restaurant"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import * as z from 'zod';
import Select from 'react-select';
import { getRestaurantById, updateRestaurant } from '@/lib/api';
import Image from 'next/image';
import { X } from 'lucide-react';

// Define the schema
export const restaurantSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  pinCode: z.string().regex(/^\d{5,10}$/, 'Pin code must be 5-10 digits'),
  categories: z.array(z.string()).min(1, 'At least one category required'),
  description: z.string().optional(),
  website: z.string().url('Invalid URL').optional(),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Opening time must be HH:MM'),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Closing time must be HH:MM'),
  offersDelivery: z.boolean().default(false),
  offersDineIn: z.boolean().default(false),
  offersPickup: z.boolean().default(false),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

// Options for react-select
const categoryOptions = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'vegetarian', label: 'Vegetarian' },
];

export default function EditRestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      pinCode: '',
      categories: [],
      description: '',
      website: '',
      phoneNumber: '',
      openingTime: '',
      closingTime: '',
      offersDelivery: false,
      offersDineIn: false,
      offersPickup: false,
    },
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      setIsLoading(true);
      try {
        const data = await getRestaurantById(id as string);
        const restaurant = data.restaurant;

        form.reset({
          name: restaurant.name,
          address: restaurant.address,
          city: restaurant.city,
          pinCode: restaurant.pinCode,
          categories: restaurant.categories,
          description: restaurant.description || '',
          website: restaurant.website || '',
          phoneNumber: restaurant.phoneNumber,
          openingTime: restaurant.openingTime,
          closingTime: restaurant.closingTime,
          offersDelivery: restaurant.offersDelivery,
          offersDineIn: restaurant.offersDineIn,
          offersPickup: restaurant.offersPickup,
        });

        setExistingImages(restaurant.images);
      } catch (error: any) {
        console.error('Error fetching restaurant:', error);
        toast.error(error.message || 'Failed to fetch restaurant details');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, router, form]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
      setSelectedImages(fileArray);
      setImagePreviews(newPreviews);
    }
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setImagesToRemove((prev) => [...prev, imageUrl]);
    setExistingImages((prev) => prev.filter((url) => url !== imageUrl));
  };

  const onSubmit = async (data: RestaurantFormData) => {
    // Validate that at least 3 images remain
    const remainingImages = existingImages.length + selectedImages.length;
    if (remainingImages < 3) {
      toast.error('At least 3 images are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add categories as JSON array
      console.log('Categories before FormData:', data.categories); // Debug log
      formData.append('categories', JSON.stringify(data.categories));

      // Add other fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'categories') {
          formData.append(key, String(value));
        }
      });

      // Add new images
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      // Add images to keep (existing images not marked for removal)
      existingImages.forEach((url) => {
        formData.append('imagesToKeep', url);
      });

      // Add images to remove
      imagesToRemove.forEach((url) => {
        formData.append('imagesToRemove', url);
      });

      // Debug FormData content
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await updateRestaurant(id as string, formData);
      toast.success('Restaurant updated successfully');
      router.push(`/restaurant/${id}`);
    } catch (error: any) {
      console.error('Error updating restaurant:', error);
      toast.error(error.message || 'Failed to update restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Restaurant</CardTitle>
          <CardDescription>Update the details of your restaurant</CardDescription>
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
                        <Input placeholder="Restaurant Name" {...field} />
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
                        <Select
                          isMulti
                          options={categoryOptions}
                          onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                          value={categoryOptions.filter((option) => field.value.includes(option.value))}
                          placeholder="Select categories"
                          classNamePrefix="react-select"
                        />
                      </FormControl>
                      <FormDescription>Select one or more categories</FormDescription>
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
                        <Input placeholder="123 Main St" {...field} />
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
                        <Input placeholder="New York" {...field} />
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
                        <Input placeholder="10001" {...field} />
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
                        <Input placeholder="1234567890" {...field} />
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
                      <Input placeholder="https://example.com" {...field} />
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
                        <Input placeholder="09:00" {...field} />
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
                        <Input placeholder="22:00" {...field} />
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
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">
                    Current images: {existingImages.length} (At least 3 images required)
                  </p>
                </div>
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm">Existing Images</div>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={url}
                            alt={`Existing ${index + 1}`}
                            width={100}
                            height={100}
                            className="h-24 w-24 object-cover rounded-md"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-0 right-0 h-6 w-6"
                            onClick={() => handleRemoveExistingImage(url)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
                <FormDescription>Upload additional images if needed (max 10MB each)</FormDescription>
                {selectedImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm">{selectedImages.length} new image(s) selected</div>
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((url, index) => (
                        <Image
                          key={index}
                          src={url}
                          alt={`Preview ${index + 1}`}
                          width={100}
                          height={100}
                          className="h-24 w-24 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Updating Restaurant...' : 'Update Restaurant'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
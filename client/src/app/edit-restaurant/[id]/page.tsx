'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { restaurantSchema, RestaurantFormData } from '@/lib/types';
import Select from 'react-select';
import { getRestaurantById, updateRestaurant } from '@/lib/api';
import Image from 'next/image';
import { X } from 'lucide-react';
import MapProvider from '@/components/map-provider';
import RestaurantLocationPicker from '@/components/restaurant-location-picker';

// ... (CategoryOption and categoryOptions unchanged)
type CategoryOption = {
  value: 'restaurant' | 'cafe' | 'hotel' | 'vegetarian';
  label: string;
};

const categoryOptions: CategoryOption[] = [
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
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      setIsLoading(true);
      try {
        const data = await getRestaurantById(id);
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
          offersDelivery: restaurant.offersDelivery ?? false,
          offersDineIn: restaurant.offersDineIn ?? false,
          offersPickup: restaurant.offersPickup ?? false,
          latitude: restaurant.latitude || 0,
          longitude: restaurant.longitude || 0,
        });

        setExistingImages(restaurant.images);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        toast.error('Failed to fetch restaurant details');
        router.push('/restaurants');
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
      const fileArray = Array.from(e.target.files).filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB limit`);
          return false;
        }
        return true;
      });
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
      setSelectedImages(fileArray);
      setImagePreviews(newPreviews);
    }
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    if (confirm('Are you sure you want to remove this image?')) {
      setImagesToRemove((prev) => [...prev, imageUrl]);
      setExistingImages((prev) => prev.filter((url) => url !== imageUrl));
    }
  };

  const removeNewImage = (index: number) => {
    if (confirm('Are you sure you want to remove this image?')) {
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => {
        const url = prev[index];
        URL.revokeObjectURL(url);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const onSubmit: SubmitHandler<RestaurantFormData> = async (data) => {
    const remainingImages = existingImages.length + selectedImages.length;
    if (remainingImages < 3) {
      toast.error('At least 3 images are required');
      return;
    }
    if (data.latitude === 0 && data.longitude === 0) {
      toast.error('Please select a valid location on the map');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('categories', JSON.stringify(data.categories));
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'categories') {
          formData.append(key, String(value));
        }
      });
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });
      existingImages.forEach((url) => {
        formData.append('imagesToKeep', url);
      });
      imagesToRemove.forEach((url) => {
        formData.append('imagesToRemove', url);
      });

      await updateRestaurant(id, formData);
      toast.success('Restaurant updated successfully');
      router.push(`/restaurants/${id}`);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error('Failed to update restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Restaurant</CardTitle>
          <CardDescription>Update the details of your restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <MapProvider>
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
                          <Input placeholder="Name" {...field} aria-label="Restaurant Name" />
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
                            onChange={(selected) =>
                              field.onChange(selected.map((option) => option.value))
                            }
                            value={categoryOptions.filter((option) => field.value.includes(option.value))}
                            placeholder="Select categories"
                            classNamePrefix="react-select"
                            aria-label="Select restaurant categories"
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
                        <Textarea placeholder="Describe the restaurant" className="resize-none" {...field} aria-label="Restaurant Description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <RestaurantLocationPicker
                          initialLat={form.getValues('latitude')}
                          initialLng={form.getValues('longitude')}
                          initialAddress={field.value}
                          onLocationSelect={({ lat, lng, address, city, pinCode }) => {
                            form.setValue('latitude', lat);
                            form.setValue('longitude', lng);
                            form.setValue('address', address);
                            form.setValue('city', city);
                            form.setValue('pinCode', pinCode);
                          }}
                        />
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
                        <Input placeholder="1234567890" {...field} aria-label="Phone Number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} value={field.value ?? ''} aria-label="Website" />
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
                          <Input placeholder="09:00" {...field} aria-label="Opening Time" />
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
                          <Input placeholder="22:00" {...field} aria-label="Closing Time" />
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
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} aria-label="Offers Delivery" />
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
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} aria-label="Offers Dine-in" />
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
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} aria-label="Offers Pickup" />
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
                      Current images: {existingImages.length + selectedImages.length} (At least 3 images required)
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
                              aria-label={`Remove image ${index + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    aria-label="Upload additional restaurant images"
                  />
                  <FormDescription>Upload additional images if needed (max 10MB each, JPEG/PNG/WebP)</FormDescription>
                  {selectedImages.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm">{selectedImages.length} new image(s) selected</div>
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((url, index) => (
                          <div key={index} className="relative">
                            <Image
                              src={url}
                              alt={`Preview ${index + 1}`}
                              width={100}
                              height={100}
                              className="h-24 w-24 object-cover rounded-md"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-0 right-0 h-6 w-6"
                              onClick={() => removeNewImage(index)}
                              aria-label={`Remove image ${index + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating Restaurant...' : 'Update Restaurant'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => form.reset()}
                    disabled={isSubmitting}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          </MapProvider>
        </CardContent>
      </Card>
    </div>
  );
}
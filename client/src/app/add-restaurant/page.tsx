'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as z from 'zod';
import Select from 'react-select';
import { createRestaurant } from '@/lib/api';
import Image from 'next/image';

// Define the schema
export const restaurantSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  pinCode: z.string().regex(/^\d{5,10}$/, 'Pin code must be 5-10 digits'),
  categories: z.array(z.enum(['restaurant', 'cafe', 'hotel', 'vegetarian'])).min(1, 'At least one category required'),
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

export default function AddRestaurantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
      openingTime: '09:00',
      closingTime: '22:00',
      offersDelivery: false,
      offersDineIn: true,
      offersPickup: false,
    },
  });

  // Cleanup image preview URLs
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

  const onSubmit = async (data: RestaurantFormData) => {
    if (selectedImages.length < 3) {
      toast.error('Please upload at least 3 images');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add categories as JSON array
      formData.append('categories', JSON.stringify(data.categories));

      // Add other fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'categories') {
          formData.append(key, String(value));
        }
      });

      // Add images
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      await createRestaurant(formData);
      toast.success('Restaurant added successfully');
      router.push('/');
    } catch (error: any) {
      console.error('Error adding restaurant:', error);
      toast.error(error.message || 'Failed to add restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
                <FormDescription>Upload at least 3 images (max 10MB each)</FormDescription>
                {selectedImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm">{selectedImages.length} image(s) selected</div>
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
                {isSubmitting ? 'Adding Restaurant...' : 'Add Restaurant'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
"use client"
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">You are offline</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Please check your internet connection and try again.
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500"
      >
        Retry
      </Button>
    </div>
  );
}
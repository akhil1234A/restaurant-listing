
import type { LoginFormData, SignupFormData, RestaurantResponse, Restaurant } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
}

// Auth API calls
export async function login(data: LoginFormData) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return handleResponse(response);
}

export async function register(data: SignupFormData) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
    }),
    credentials: "include",
  });
  return handleResponse(response);
}

export async function refreshToken() {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
}

export async function logout() {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
}

// Restaurant API calls
export async function getRestaurants(page = 1, limit = 10, search = "") {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) {
    queryParams.append("search", search);
  }

  const response = await fetch(`${API_URL}/api/restaurants?${queryParams}`, {
    credentials: "include",
  });
  return handleResponse<RestaurantResponse>(response);
}

export async function getRestaurantById(id: string) {
  const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
    credentials: "include",
  });
  return handleResponse<{ restaurant: Restaurant }>(response);
}

export async function createRestaurant(data: FormData) {
  const response = await fetch(`${API_URL}/api/restaurants`, {
    method: "POST",
    body: data,
    credentials: "include",
  });
  return handleResponse(response);
}

export async function updateRestaurant(id: string, data: FormData) {
  const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
    method: "PATCH",
    body: data,
    credentials: "include",
  });
  return handleResponse(response);
}

export async function deleteRestaurant(id: string) {
  const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
}

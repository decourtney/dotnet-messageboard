/**
 * client.ts
 *
 * Purpose:
 * Frontend API client for interacting with the backend message board service.
 * Provides typed interfaces that match C# backend models/DTOs,
 * manages JWT authentication, and exposes methods for authentication,
 * user management, threads, and messages.
 *
 * Key Features:
 * - Centralized fetch wrapper with automatic token injection
 * - 401 Unauthorized handling via callback
 * - TypeScript interfaces for backend model parity
 * - All endpoints implemented as async methods returning typed data
 *
 * Dependencies:
 * - Relies on browser `fetch` API
 * - Requires backend to be running and accessible at API_BASE_URL
 *
 * Usage:
 *   import { apiClient } from './client';
 *   apiClient.login({ username, password }).then(res => { ... });
 */

// ==== Type Definitions (mirror backend C# models) ====

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface Thread {
  id: number;
  title: string;
  userId: number;
  user: User;
  createdAt: string;
  messageCount?: number;
}

export interface Message {
  id: number;
  content: string;
  threadId: number;
  userId: number;
  user: User;
  createdAt: string;
}

// ==== Auth DTOs (mirror backend C# DTOs) ====

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// ==== API Configuration ====

const API_BASE_URL = "http://localhost:5285";

// ==== API Client Class ====

class ApiClient {
  private baseUrl: string;
  private _token: string | undefined;
  private _onUnauthorized: (() => void) | undefined;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ===== Token Management =====

  /** Set or clear the JWT token used for authenticated requests */
  setAuthToken(token: string | undefined) {
    this._token = token;
  }

  /** Set a callback to run when the API responds with 401 Unauthorized */
  onUnauthorized(callback: () => void) {
    this._onUnauthorized = callback;
  }

  // ===== Internal Request Wrapper =====

  /**
   * Perform a fetch request with automatic JSON parsing,
   * error handling, and Authorization header injection.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Attach Bearer token if available
    if (this._token) {
      headers.Authorization = `Bearer ${this._token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      console.log(`API Request: ${config.method || "GET"} ${url}`);
      const response = await fetch(url, config);

      // Handle unauthorized access
      if (response.status === 401) {
        console.log("Unauthorized - calling logout callback");
        if (this._onUnauthorized) {
          this._onUnauthorized();
        }
        throw new Error("Unauthorized");
      }

      // Handle non-2xx errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return parsed JSON data
      const data = await response.json();
      console.log(`API Response:`, data);
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // ===== Authentication Endpoints =====

  /** Create a new user account */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  /** Authenticate a user and receive a JWT token */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // ===== Miscellaneous =====

  /** Example endpoint to verify connectivity to backend */
  async testConnection(): Promise<any> {
    return this.request("/weatherforecast");
  }

  // ===== User Endpoints =====

  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/api/users");
  }

  async createUser(userData: {
    username: string;
    email: string;
  }): Promise<User> {
    return this.request<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // ===== Thread Endpoints =====

  async getThreads(): Promise<Thread[]> {
    return this.request<Thread[]>("/api/threads");
  }

  async createThread(threadData: {
    title: string;
    userId: number;
  }): Promise<Thread> {
    return this.request<Thread>("/api/threads", {
      method: "POST",
      body: JSON.stringify(threadData),
    });
  }

  async getThread(id: number): Promise<Thread> {
    return this.request<Thread>(`/api/threads/${id}`);
  }

  // ===== Message Endpoints =====

  async getMessages(threadId?: number): Promise<Message[]> {
    const endpoint = threadId
      ? `/api/messages?threadId=${threadId}`
      : "/api/messages";
    return this.request<Message[]>(endpoint);
  }

  /** Create a message (userId derived from JWT on backend) */
  async createMessage(messageData: {
    content: string;
    threadId: number;
  }): Promise<Message> {
    return this.request<Message>("/api/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  }

  async deleteMessage(id: number): Promise<void> {
    return this.request<void>(`/api/messages/${id}`, {
      method: "DELETE",
    });
  }
}

// Export a single configured instance
export const apiClient = new ApiClient(API_BASE_URL);

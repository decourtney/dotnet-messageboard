// Types that match your C# models
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

// Auth DTOs that match your C# DTOs
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

// API configuration
const API_BASE_URL = "http://localhost:5285";

class ApiClient {
  private baseUrl: string;
  private _token: string | undefined;
  private _onUnauthorized: (() => void) | undefined;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Token management
  setAuthToken(token: string | undefined) {
    this._token = token;
  }

  onUnauthorized(callback: () => void) {
    this._onUnauthorized = callback;
  }

  // Generic HTTP method with auth support
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if we have a token
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

      // Handle 401 Unauthorized
      if (response.status === 401) {
        console.log("Unauthorized - calling logout callback");
        if (this._onUnauthorized) {
          this._onUnauthorized();
        }
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API Response:`, data);
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // Test connection (using the weather endpoint)
  async testConnection(): Promise<any> {
    return this.request("/weatherforecast");
  }

  // User endpoints (for when you add UserController)
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

  // Thread endpoints (for when you add ThreadController)
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

  // Message endpoints - UPDATED: removed userId from createMessage
  async getMessages(threadId?: number): Promise<Message[]> {
    const endpoint = threadId
      ? `/api/messages?threadId=${threadId}`
      : "/api/messages";
    return this.request<Message[]>(endpoint);
  }

  // Updated: no userId needed - backend gets it from JWT token
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

// Export a single instance
export const apiClient = new ApiClient(API_BASE_URL);

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
  thread?: Thread;
  createdAt: string;
}

// API configuration
const API_BASE_URL = "http://localhost:5285"; // Replace with your actual port

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Generic HTTP method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`API Request: ${config.method || "GET"} ${url}`);

      const response = await fetch(url, config);

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

  // Message endpoints (for when you add MessageController)
  async getMessages(threadId?: number): Promise<Message[]> {
    const endpoint = threadId
      ? `/api/messages?threadId=${threadId}`
      : "/api/messages";
    return this.request<Message[]>(endpoint);
  }

  async createMessage(messageData: {
    content: string;
    threadId: number;
    userId: number;
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

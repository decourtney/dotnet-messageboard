/**
 * AppState.ts
 * ---------------------------------------------------------
 * Centralized state manager for the Message Board app.
 *
 * Responsibilities:
 * - Store and manage authentication state (token, current user).
 * - Store and manage the message list.
 * - Provide subscription mechanism for authentication changes.
 * - Handle API calls for loading/creating messages and user auth.
 * - Update the DOM with current message data and error messages.
 *
 * Dependencies:
 * - apiClient: Handles HTTP calls to the backend API.
 * - Message, User types: Data structures from the API layer.
 *
 * Notes:
 * - This is a singleton — `appState` is the single instance used app-wide.
 * - UI updates are handled directly here via `renderMessages` and `showError`.
 * ---------------------------------------------------------
 */

import { apiClient, Message, User } from "../api/client";

// Re-export types for convenience so imports can come from state layer
export { Message, User, Thread } from "../api/client";

export class AppState {
  private _messages: Message[] = []; // In-memory message store
  private _token: string | null = null; // JWT for authenticated requests
  private _currentUser: User | null = null; // Logged-in user data
  private _authListeners: Array<() => void> = []; // Auth state subscribers
  private _sortOrder: "asc" | "desc" = "desc"; // Message sort order
  private _tokenExpiry: Date | null = null;

  constructor() {
    this.loadPersistedAuth(); // Load any persisted auth state on init
  }

  // --- GETTERS ---
  get messages(): Message[] {
    return this._messages;
  }
  get isAuthenticated(): boolean {
    return !!this._token && !!this._currentUser;
  }
  get currentUser(): User | null {
    return this._currentUser;
  }
  get sortOrder(): "asc" | "desc" {
    return this._sortOrder;
  }

  // --- AUTH STATE SUBSCRIPTION ---
  onAuthChange(cb: () => void) {
    this._authListeners.push(cb);
    // Return unsubscribe function
    return () => {
      this._authListeners = this._authListeners.filter((x) => x !== cb);
    };
  }

  // --- AUTH TOKEN MANAGEMENT ---
  private notifyAuthChange() {
    this._authListeners.forEach((cb) => cb());
  }

  // --- AUTH PERSISTENCE ---
  private loadPersistedAuth() {
    const token = localStorage.getItem("auth_token");
    const tokenExpiry = localStorage.getItem("token_expiry");
    const userData = localStorage.getItem("current_user");

    if (token && tokenExpiry && new Date(tokenExpiry) > new Date()) {
      this._token = token;
      this._tokenExpiry = new Date(tokenExpiry);
      this._currentUser = userData ? JSON.parse(userData) : null;

      // Validate token is still good with server
      this.validateStoredToken();
    } else {
      // Clean up expired/invalid data
      this.clearPersistedAuth();
    }
  }

  // NOTE: Temporary token validation approach
  // Validate Stored Token
  private async validateStoredToken() {
    try {
      // Temp token validation: try to make an authenticated request
      await apiClient.getMessages(); // Any authenticated endpoint
      // If no error, token is valid
    } catch (error) {
      // If 401 or network error, logout
      this.logout();
    }
  }

  // Clear persisted auth data from localStorage
  private clearPersistedAuth() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("current_user");
  }

  // --- AUTHENTICATION ---
  async login(username: string, password: string): Promise<boolean> {
    try {
      const res = await apiClient.login({ username, password });
      if (!res?.token || !res?.user) throw new Error("Invalid login response");

      this._token = res.token;
      this._currentUser = res.user;
      this._tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      // Persist to localStorage
      localStorage.setItem("auth_token", this._token);
      localStorage.setItem("token_expiry", this._tokenExpiry.toISOString());
      localStorage.setItem("current_user", JSON.stringify(this._currentUser));

      apiClient.setAuthToken(this._token);

      if (apiClient.onUnauthorized)
        apiClient.onUnauthorized(() => this.logout());

      this.notifyAuthChange();
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      this.showError("Login failed. Check credentials.");
      return false;
    }
  }

  logout() {
    this._token = null;
    this._currentUser = null;
    this._tokenExpiry = null;
    this.clearPersistedAuth();
    this.notifyAuthChange();
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      const res = await apiClient.register({ username, email, password });
      if (res?.token && res?.user) {
        this._token = res.token;
        this._currentUser = res.user;
        apiClient.setAuthToken(this._token);

        if (apiClient.onUnauthorized)
          apiClient.onUnauthorized(() => this.logout());

        this.notifyAuthChange();
        return true;
      }
      this.showError("Account created. Please log in.");
      return false;
    } catch (err) {
      console.error("Register failed:", err);
      this.showError("Registration failed.");
      return false;
    }
  }

  // --- MESSAGE STATE MANAGEMENT ---
  public setSortOrder(order: "asc" | "desc") {
    this._sortOrder = order;
    this.renderMessages(); // Re-render with new sort
  }

  setMessages(messages: Message[]) {
    this._messages = messages;
    this.renderMessages();
  }

  addMessage(message: Message) {
    this._messages.push(message);
    this.renderMessages();
  }

  async loadMessages(threadId?: number): Promise<void> {
    try {
      console.log("Loading messages from API...");
      const messages = await apiClient.getMessages(threadId);
      this.setMessages(messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      this.showError("Failed to load messages. Please try again.");
    }
  }

  async createMessage(content: string, threadId: number): Promise<void> {
    // Client-side auth check before sending message
    if (!this.isAuthenticated) {
      this.showError("You must be logged in to send messages.");
      return;
    }

    try {
      console.log("Creating message via API...");
      const newMessage = await apiClient.createMessage({ content, threadId });
      this.addMessage(newMessage);
    } catch (error) {
      console.error("Failed to create message:", error);
      this.showError("Failed to send message. Please try again.");
    }
  }

  async testApiConnection(): Promise<boolean> {
    try {
      console.log("Testing API connection...");
      await apiClient.testConnection();
      console.log("API connection successful!");
      return true;
    } catch (error) {
      console.error("API connection failed:", error);
      this.showError(
        "Cannot connect to server. Please make sure the API is running."
      );
      return false;
    }
  }

  clearMessages() {
    this._messages = [];
    this.renderMessages();
  }

  // --- PRIVATE HELPERS ---
  private renderMessages() {
    const container = document.getElementById("messages-list"); // Changed from "messages-container"
    if (!container) {
      console.warn("Messages list container not found");
      return;
    }

    container.innerHTML = "";

    // Empty state
    if (this._messages.length === 0) {
      container.innerHTML =
        '<div class="text-muted">No messages yet. Be the first to start the conversation!</div>';
      return;
    }

    // Sort the existing messages based on current sort order
    const sortedMessages = [...this._messages].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return this._sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    // Render each message card
    sortedMessages.forEach((message) => {
      const messageDiv = document.createElement("div");
      messageDiv.className = "card mb-2";
      messageDiv.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <strong>${message.user.username}</strong>
            <p class="mb-0 mt-1">${message.content}</p>
          </div>
          <small class="text-muted">${new Date(
            message.createdAt
          ).toLocaleString()}</small>
        </div>
      </div>
    `;
      container.appendChild(messageDiv);
    });

    console.log(`Rendered ${this._messages.length} messages`);
  }

  private showError(message: string) {
    const container = document.getElementById("messages-container");
    if (!container) return;

    const errorDiv = document.createElement("div");
    errorDiv.className = "alert alert-danger alert-dismissible fade show";
    errorDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    container.insertBefore(errorDiv, container.firstChild);

    // Auto-remove after 5s
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// Singleton instance for use across app
export const appState = new AppState();

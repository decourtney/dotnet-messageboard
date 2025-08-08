// src/ts/state/AppState.ts
import { apiClient, Message, User } from "../api/client";

// Re-export types for convenience
export { Message, User, Thread } from "../api/client";

export class AppState {
  private _messages: Message[] = [];
  private _token: string | null = null;
  private _currentUser: User | null = null;
  private _authListeners: Array<() => void> = [];

  // Messages getter/setter
  get messages(): Message[] {
    return this._messages;
  }
  get isAuthenticated(): boolean {
    return !!this._token && !!this._currentUser;
  }
  get currentUser(): User | null {
    return this._currentUser;
  }

  // Auth subscription
  onAuthChange(cb: () => void) {
    this._authListeners.push(cb);
    return () => {
      this._authListeners = this._authListeners.filter((x) => x !== cb);
    };
  }
  private notifyAuthChange() {
    this._authListeners.forEach((cb) => cb());
  }

  // Message methods (unchanged except createMessage uses current user)
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
    // Frontend validation for UX
    if (!this.isAuthenticated) {
      this.showError("You must be logged in to send messages.");
      return;
    }

    try {
      console.log("Creating message via API...");
      const newMessage = await apiClient.createMessage({
        content,
        threadId,
      });
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

  // AUTH methods:
  async login(username: string, password: string): Promise<boolean> {
    try {
      const res = await apiClient.login({ username, password });
      if (!res?.token || !res?.user) throw new Error("Invalid login response");
      this._token = res.token;
      this._currentUser = res.user;
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

  logout() {
    this._token = null;
    this._currentUser = null;
    apiClient.setAuthToken(undefined);
    this.notifyAuthChange();
  }

  // Private UI rendering and helpers (same as before)
  private renderMessages() {
    const container = document.getElementById("messages-list"); // Changed from "messages-container"
    if (!container) {
      console.warn("Messages list container not found");
      return;
    }

    container.innerHTML = "";

    if (this._messages.length === 0) {
      container.innerHTML =
        '<div class="text-muted">No messages yet. Be the first to start the conversation!</div>';
      return;
    }

    this._messages.forEach((message) => {
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

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// singleton
export const appState = new AppState();

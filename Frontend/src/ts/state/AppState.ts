// src/ts/state/AppState.ts
import { apiClient, Message } from "../api/client";

// Re-export types for convenience
export { Message, User, Thread } from "../api/client";

export class AppState {
  // Private property - only this class can modify it directly
  private _messages: Message[] = [];

  // Public getter - other code can READ but not modify directly
  get messages(): Message[] {
    return this._messages;
  }

  // Method to update messages - this is like React's setState
  setMessages(messages: Message[]) {
    this._messages = messages;
    this.renderMessages(); // Automatically update UI
  }

  // Method to add a single message
  addMessage(message: Message) {
    this._messages.push(message);
    this.renderMessages(); // Automatically update UI
  }

  // Method to load messages from API
  async loadMessages(threadId?: number): Promise<void> {
    try {
      console.log("Loading messages from API...");
      const messages = await apiClient.getMessages(threadId);
      this.setMessages(messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      // Show user-friendly error
      this.showError("Failed to load messages. Please try again.");
    }
  }

  // Method to create a new message via API
  async createMessage(
    content: string,
    threadId: number,
    userId: number
  ): Promise<void> {
    try {
      console.log("Creating message via API...");
      const newMessage = await apiClient.createMessage({
        content,
        threadId,
        userId,
      });
      this.addMessage(newMessage);
    } catch (error) {
      console.error("Failed to create message:", error);
      this.showError("Failed to send message. Please try again.");
    }
  }

  // Method to test API connection
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

  // Method to clear all messages
  clearMessages() {
    this._messages = [];
    this.renderMessages(); // Automatically update UI
  }

  // Private method - handles updating the DOM
  private renderMessages() {
    const container = document.getElementById("messages-container");
    if (!container) {
      console.warn("Messages container not found");
      return;
    }

    // Clear existing content
    container.innerHTML = "";

    // If no messages, show empty state
    if (this._messages.length === 0) {
      container.innerHTML = '<p class="text-muted">No messages yet.</p>';
      return;
    }

    // Render each message
    this._messages.forEach((message) => {
      const messageDiv = document.createElement("div");
      messageDiv.className = "card mb-2";
      messageDiv.innerHTML = `
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <strong>${message.user.username}</strong>
            <small class="text-muted">${new Date(
              message.createdAt
            ).toLocaleString()}</small>
          </div>
          <p class="mb-0 mt-1">${message.content}</p>
        </div>
      `;
      container.appendChild(messageDiv);
    });

    console.log(`Rendered ${this._messages.length} messages`);
  }

  // Helper method to show errors to user
  private showError(message: string) {
    const container = document.getElementById("messages-container");
    if (!container) return;

    const errorDiv = document.createElement("div");
    errorDiv.className = "alert alert-danger alert-dismissible fade show";
    errorDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Insert at the top
    container.insertBefore(errorDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// Create and export a single instance (singleton pattern)
export const appState = new AppState();

import "../scss/main.scss";
import { appState } from "./state/AppState";

console.log("Message Board app loaded!");

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

async function initializeApp() {
  console.log("Initializing app...");

  // Test API connection first
  const apiConnected = await appState.testApiConnection();

  if (apiConnected) {
    // Try to load real messages from API
    await appState.loadMessages();
  } else {
    // Fall back to sample data if API is not available
    console.log("API not available, loading sample data...");
    loadSampleMessages();
  }

  // Set up form handling
  setupMessageForm();
}

function loadSampleMessages() {
  // Fake data that matches the API structure
  const sampleMessages = [
    {
      id: 1,
      content: "Welcome to the message board!",
      threadId: 1,
      userId: 1,
      user: {
        id: 1,
        username: "Admin",
        email: "admin@example.com",
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      content: "This is sample data since the API is not connected yet.",
      threadId: 1,
      userId: 2,
      user: {
        id: 2,
        username: "System",
        email: "system@example.com",
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    },
  ];

  // This will automatically render the messages
  appState.setMessages(sampleMessages);
}

function setupMessageForm() {
  const addBtn = document.getElementById("add-message-btn");
  const clearBtn = document.getElementById("clear-messages-btn");
  const usernameInput = document.getElementById(
    "username-input"
  ) as HTMLInputElement;
  const messageInput = document.getElementById(
    "message-input"
  ) as HTMLTextAreaElement;

  addBtn?.addEventListener("click", async () => {
    const username = usernameInput?.value.trim() || "Anonymous";
    const content = messageInput?.value.trim();

    if (!content) {
      alert("Please enter a message");
      return;
    }

    // For now, we'll still use fake data since we don't have user auth yet
    // Later this will be: await appState.createMessage(content, currentThreadId, currentUserId)

    const newMessage = {
      id: Date.now(), // Temporary ID
      content: content,
      threadId: 1, // Temporary - will come from current thread
      userId: 999, // Temporary - will come from logged in user
      user: {
        id: 999,
        username: username,
        email: `${username}@example.com`,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    // Add to state - this will automatically update the UI
    appState.addMessage(newMessage);

    // Clear the form
    if (messageInput) messageInput.value = "";
    if (usernameInput) usernameInput.value = "";

    console.log("Added message:", newMessage);
  });

  clearBtn?.addEventListener("click", () => {
    appState.clearMessages();
    console.log("Cleared all messages");
  });
}

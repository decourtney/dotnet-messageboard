/**
 * app.ts
 *
 * Entry point for the Message Board frontend.
 *
 * Responsibilities:
 *  - Initialize the application once the DOM is ready
 *  - Test API connectivity, load real or fallback (sample) messages
 *  - Manage authentication UI and API calls (login, register, logout)
 *  - Handle adding/clearing messages
 *  - Reactively update UI when authentication state changes
 *
 * Dependencies:
 *  - SCSS styles from ../scss/main.scss
 *  - AppState singleton from ./state/AppState for global state + API interactions
 *
 * Notes:
 *  - `updateUIForAuthState()` expects specific element IDs:
 *    login-section, register-section, user-section, message-form
 *    These do NOT currently match the IDs in index.html. You need to rename them or adjust here.
 */

import "../scss/main.scss";
import { appState } from "./state/AppState";

console.log("Message Board app loaded!");

// Initialize the app after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

/**
 * Initializes the application:
 *  - Verifies API connectivity
 *  - Loads messages (real or fallback sample)
 *  - Sets up authentication and message form UI handlers
 *  - Subscribes to authentication state changes
 *  - Triggers initial UI update
 */
async function initializeApp() {
  console.log("Initializing app...");

  // Check if API is reachable
  const apiConnected = await appState.testApiConnection();

  if (apiConnected) {
    // Load real messages from the API
    await appState.loadMessages();
  } else {
    // Use sample/fallback data if API is unavailable
    console.log("API not available, loading sample data...");
    loadSampleMessages();
  }

  // Wire up authentication UI
  setupAuthUI();

  // Wire up message form
  setupMessageForm();

  // Re-render parts of the UI when authentication state changes
  appState.onAuthChange(() => {
    updateUIForAuthState();
  });

  // Run an initial UI update
  updateUIForAuthState();
}

/**
 * Loads a fixed set of sample messages into state.
 * Used as a fallback when the backend API is not reachable.
 */
function loadSampleMessages() {
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

  appState.setMessages(sampleMessages);
}

/**
 * Sets up event listeners for authentication UI:
 *  - Login button
 *  - Registration button
 *  - Logout button
 */
function setupAuthUI() {
  // ----- Login -----
  const loginBtn = document.getElementById("login-btn");
  const loginUsernameInput = document.getElementById(
    "login-username"
  ) as HTMLInputElement;
  const loginPasswordInput = document.getElementById(
    "login-password"
  ) as HTMLInputElement;

  loginBtn?.addEventListener("click", async () => {
    const username = loginUsernameInput?.value.trim();
    const password = loginPasswordInput?.value.trim();

    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    console.log("Attempting login...");
    const success = await appState.login(username, password);

    if (success) {
      console.log("Login successful!");
      loginUsernameInput.value = "";
      loginPasswordInput.value = "";
    }
  });

  // ----- Registration -----
  const registerBtn = document.getElementById("register-btn");
  const registerUsernameInput = document.getElementById(
    "register-username"
  ) as HTMLInputElement;
  const registerEmailInput = document.getElementById(
    "register-email"
  ) as HTMLInputElement;
  const registerPasswordInput = document.getElementById(
    "register-password"
  ) as HTMLInputElement;

  registerBtn?.addEventListener("click", async () => {
    const username = registerUsernameInput?.value.trim();
    const email = registerEmailInput?.value.trim();
    const password = registerPasswordInput?.value.trim();

    if (!username || !email || !password) {
      alert("Please fill in all registration fields");
      return;
    }

    console.log("Attempting registration...");
    const success = await appState.register(username, email, password);

    if (success) {
      console.log("Registration successful!");
      registerUsernameInput.value = "";
      registerEmailInput.value = "";
      registerPasswordInput.value = "";
    }
  });

  // ----- Logout -----
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn?.addEventListener("click", () => {
    console.log("Logging out...");
    appState.logout();
  });
}

/**
 * Sets up event listeners for the message form:
 *  - Add message
 *  - Clear messages
 */
function setupMessageForm() {
  const addBtn = document.getElementById("add-message-btn");
  const clearBtn = document.getElementById("clear-messages-btn");
  const messageInput = document.getElementById(
    "message-input"
  ) as HTMLTextAreaElement;

  // Add new message
  addBtn?.addEventListener("click", async () => {
    const content = messageInput?.value.trim();

    if (!content) {
      alert("Please enter a message");
      return;
    }

    if (!appState.isAuthenticated) {
      alert("Please log in to send messages");
      return;
    }

    try {
      // Send message to API (threadId fixed as 1 for now)
      await appState.createMessage(content, 1);
      messageInput.value = "";
      console.log("Message sent successfully!");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  });

  // Clear all messages
  clearBtn?.addEventListener("click", () => {
    appState.clearMessages();
    console.log("Cleared all messages");
  });

  // Sort toggle button
  let currentSortOrder: "asc" | "desc" = "desc";

  const sortToggleBtn = document.getElementById("sort-toggle-btn");
  sortToggleBtn?.addEventListener("click", () => {
    // Toggle the local state
    currentSortOrder = currentSortOrder === "desc" ? "asc" : "desc";

    // Tell AppState to use the new sort order
    appState.setSortOrder(currentSortOrder);

    // Update button text
    if (sortToggleBtn) {
      sortToggleBtn.textContent =
        currentSortOrder === "desc" ? "↓ Newest First" : "↑ Oldest First";
    }
  });
}

/**
 * Updates visibility of login/register forms, user info, and message form
 * based on current authentication state.
 */
function updateUIForAuthState() {
  const isAuthenticated = appState.isAuthenticated;
  const currentUser = appState.currentUser;

  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  const userSection = document.getElementById("user-section");
  const messageForm = document.getElementById("message-form");

  if (isAuthenticated && currentUser) {
    console.log(`User logged in: ${currentUser.username}`);

    // Hide auth forms
    if (loginSection) loginSection.style.display = "none";
    if (registerSection) registerSection.style.display = "none";

    // Show user info + message form
    if (userSection) {
      userSection.style.display = "block";
      const userInfo = document.getElementById("current-user-info");
      if (userInfo) {
        userInfo.textContent = `Logged in as: ${currentUser.username}`;
      }
    }
    if (messageForm) messageForm.style.display = "block";
  } else {
    console.log("User not logged in");

    // Show auth forms
    if (loginSection) loginSection.style.display = "block";
    if (registerSection) registerSection.style.display = "block";

    // Hide user info + message form
    if (userSection) userSection.style.display = "none";
    if (messageForm) messageForm.style.display = "none";
  }
}

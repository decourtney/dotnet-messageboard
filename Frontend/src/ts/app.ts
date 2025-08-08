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

  // Set up auth state management
  setupAuthUI();

  // Set up form handling
  setupMessageForm();

  // Listen for auth changes to update UI
  appState.onAuthChange(() => {
    updateUIForAuthState();
  });

  // Initial UI update
  updateUIForAuthState();
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

function setupAuthUI() {
  // Login form handler
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
      // Clear login form
      if (loginUsernameInput) loginUsernameInput.value = "";
      if (loginPasswordInput) loginPasswordInput.value = "";
    }
  });

  // Register form handler
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
      // Clear register form
      if (registerUsernameInput) registerUsernameInput.value = "";
      if (registerEmailInput) registerEmailInput.value = "";
      if (registerPasswordInput) registerPasswordInput.value = "";
    }
  });

  // Logout handler
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn?.addEventListener("click", () => {
    console.log("Logging out...");
    appState.logout();
  });
}

function setupMessageForm() {
  const addBtn = document.getElementById("add-message-btn");
  const clearBtn = document.getElementById("clear-messages-btn");
  const messageInput = document.getElementById(
    "message-input"
  ) as HTMLTextAreaElement;

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
      // Use the real authenticated API call
      await appState.createMessage(content, 1); // Using threadId = 1 for now

      // Clear the form
      if (messageInput) messageInput.value = "";

      console.log("Message sent successfully!");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  });

  clearBtn?.addEventListener("click", () => {
    appState.clearMessages();
    console.log("Cleared all messages");
  });
}

function updateUIForAuthState() {
  const isAuthenticated = appState.isAuthenticated;
  const currentUser = appState.currentUser;

  // Show/hide login/register forms
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  const userSection = document.getElementById("user-section");
  const messageForm = document.getElementById("message-form");

  if (isAuthenticated && currentUser) {
    // User is logged in
    console.log(`User logged in: ${currentUser.username}`);

    // Hide auth forms
    if (loginSection) loginSection.style.display = "none";
    if (registerSection) registerSection.style.display = "none";

    // Show user info and message form
    if (userSection) {
      userSection.style.display = "block";
      const userInfo = document.getElementById("current-user-info");
      if (userInfo) {
        userInfo.textContent = `Logged in as: ${currentUser.username}`;
      }
    }
    if (messageForm) messageForm.style.display = "block";
  } else {
    // User is not logged in
    console.log("User not logged in");

    // Show auth forms
    if (loginSection) loginSection.style.display = "block";
    if (registerSection) registerSection.style.display = "block";

    // Hide user section and message form
    if (userSection) userSection.style.display = "none";
    if (messageForm) messageForm.style.display = "none";
  }
}

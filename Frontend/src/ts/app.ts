import "../scss/main.scss";

console.log("Message Board app loaded!");

// Basic DOM test
const app = document.getElementById("app");
if (app) {
  const testDiv = document.createElement("div");
  testDiv.textContent = "TypeScript + Webpack working!";
  testDiv.className = "alert alert-success mt-3";
  app.appendChild(testDiv);
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles/tokens.css";
import "./styles/app.css";

const root = document.querySelector<HTMLDivElement>("#root");

if (!root) {
  throw new Error("Claim to Commit could not find its application root.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

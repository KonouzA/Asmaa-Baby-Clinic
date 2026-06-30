import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Providers } from "./providers";
import { AuthProvider } from "./features/auth";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Providers>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Providers>
  </React.StrictMode>,
);

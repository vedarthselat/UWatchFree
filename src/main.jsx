import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./components/routes/Authenticator/Authenticator"; 
import './index.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./components/routes/routes";

const router = createBrowserRouter(routes, { basename: import.meta.env.Base_URL });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

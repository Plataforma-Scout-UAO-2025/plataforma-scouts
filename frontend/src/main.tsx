import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "./styles/global.css";
import App from "./App.tsx";
import { RoleProvider } from "@/context/RoleProvider";
import { store } from "./store/store.ts";
import { Provider } from 'react-redux';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin + "/app",
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }}
      >
        <RoleProvider>
          <App />
        </RoleProvider>
      </Auth0Provider>
    </Provider>
  </StrictMode>
);

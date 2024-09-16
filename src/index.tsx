import { createRoot } from "react-dom/client";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import { AuthProvider, AuthProviderProps } from "react-oidc-context";
import localOidcConfig from "./lib/localOidConfig.json";
import prodOidcConfig from "./lib/localOidConfig.json";
import { BACKEND_URL, CLIENT_ID } from "./lib/constants";
import { WebStorageStateStore } from "oidc-client-ts";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import reportWebVitals from "./reportWebVitals";

// Define the theme
const theme = extendTheme({
  colors: {
    default: {
      "default": "#1E1E1E",
      "secondary": "#757575",
      "tertiary": "#B3B3B3",
    },
    border: {
      neutral: {
        "default": "#303030",
        "secondary": "#767676",
        "tertiary": "#B2B2B2",
      },
    },
  },
});

// OIDC Configuration
let theOidcConfig;
let redirect_uri: string;

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  theOidcConfig = localOidcConfig;
  redirect_uri = "http://localhost:5173/oauth-callback";
} else {
  theOidcConfig = prodOidcConfig;
  redirect_uri = "https://veda.usecustos.org/oauth-callback";
}

const theConfig: AuthProviderProps = {
  authority: `${BACKEND_URL}/api/v1/identity-management/`,
  client_id: CLIENT_ID,
  redirect_uri: redirect_uri,
  response_type: "code",
  scope: "openid email",
  metadata: {
    authorization_endpoint: theOidcConfig.authorization_endpoint,
    token_endpoint: theOidcConfig.token_endpoint,
    revocation_endpoint: theOidcConfig.revocation_endpoint,
    introspection_endpoint: theOidcConfig.introspection_endpoint,
    userinfo_endpoint: theOidcConfig.userinfo_endpoint,
    jwks_uri: theOidcConfig.jwks_uri,
  },
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
};

// Render the app
const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);

root.render(
  <ChakraProvider theme={theme}>
    <AuthProvider
      {...theConfig}
      onSigninCallback={async () => {
        // console.log("User signed in", user);
        window.location.href = "/";
      }}
    >
      <ColorModeScript />
      <App />
    </AuthProvider>
  </ChakraProvider>
);

serviceWorker.unregister();
reportWebVitals();

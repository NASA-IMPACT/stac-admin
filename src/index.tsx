import { ColorModeScript } from "@chakra-ui/react";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { App } from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorker from "./serviceWorker";
import { AuthProvider, AuthProviderProps } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = ReactDOM.createRoot(container);

const authority = `${process.env.REACT_APP_KEYCLOAK_URL}/identity-management/`;
const wellKnownEndpoint = `${authority}tenant/${process.env.REACT_APP_KEYCLOAK_REALM}/.well-known/openid-configuration`;

async function getOidcConfig() {
  const response = await fetch(wellKnownEndpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch OIDC config from ${wellKnownEndpoint}`);
  }
  return await response.json();
}

getOidcConfig().then(oidcConfig => {
  const theConfig: AuthProviderProps = {
    authority: `${authority}`,
    client_id: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || "",
    redirect_uri: "https://dojxsily14em4.cloudfront.net",
    // redirect_uri: "http://localhost:3000",
    response_type: "code",
    scope: "openid email",
    metadata: {
      authorization_endpoint: oidcConfig.authorization_endpoint,
      token_endpoint: oidcConfig.token_endpoint,
      revocation_endpoint: oidcConfig.revocation_endpoint,
      introspection_endpoint: oidcConfig.introspection_endpoint,
      userinfo_endpoint: oidcConfig.userinfo_endpoint,
      jwks_uri: oidcConfig.jwks_uri,
    },
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    automaticSilentRenew: true,
  };

  root.render(
    <React.StrictMode>
      <ColorModeScript />
      <AuthProvider {...theConfig}>
        <App />
      </AuthProvider>
    </React.StrictMode>,
  );
}).catch((error) => {
  console.error("Error loading OIDC configuration", error);
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

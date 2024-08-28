// src/keycloak.ts
import Keycloak from "keycloak-js";

export const keycloakInstance = new Keycloak({
  realm: process.env.REACT_APP_KEYCLOAK_REALM,
  url: process.env.REACT_APP_KEYCLOAK_WORKFLOWS_API,
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
});

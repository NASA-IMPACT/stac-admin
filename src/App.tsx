import React from "react";
import { ReactKeycloakProvider, useKeycloak } from "@react-keycloak/web";
import { ChakraProvider, Box, Container } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { StacApiProvider } from "@developmentseed/stac-react";
import theme from "./theme";
import { MainNavigation } from "./components";
import Home from "./pages/Home";
import CollectionList from "./pages/CollectionList";
import CollectionForm from "./pages/CollectionForm";
import ItemList from "./pages/ItemList";
import ItemDetail from "./pages/ItemDetail";
import ItemForm from "./pages/ItemForm";
import NotFound from "./pages/NotFound";
import CollectionDetail from "./pages/CollectionDetail";
import { keycloakInstance } from "./keycloak"; // Ensure this is imported

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak || !keycloak.authenticated) {
    keycloak?.login();
    return null;
  }

  return <>{children}</>;
};

// Main App component
const App = () => (
  <ChakraProvider theme={theme}>
    <StacApiProvider apiUrl={process.env.REACT_APP_STAC_API!}>
      <Router>
        <Container mx="auto" p="5" bgColor="white" boxShadow="md">
          <Box
            as="header"
            borderBottom="1px dashed"
            borderColor="gray.300"
            mb="4"
            pb="4"
            display="flex"
          >
            <Box flex="1" fontWeight="bold" textTransform="uppercase">STAC Admin</Box>
            <MainNavigation />
          </Box>
          <Box as="main">
            <Routes>
              {/* Protect routes with Keycloak authentication */}
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/collections/" element={<PrivateRoute><CollectionList /></PrivateRoute>} />
              <Route path="/collections/:collectionId/" element={<PrivateRoute><CollectionDetail /></PrivateRoute>} />
              <Route path="/collections/:collectionId/edit/" element={<PrivateRoute><CollectionForm /></PrivateRoute>} />
              <Route path="/items/" element={<PrivateRoute><ItemList /></PrivateRoute>} />
              <Route path="/collections/:collectionId/items/:itemId/" element={<PrivateRoute><ItemDetail /></PrivateRoute>} />
              <Route path="/collections/:collectionId/items/:itemId/edit/" element={<PrivateRoute><ItemForm /></PrivateRoute>} />
              <Route path="*" element={<PrivateRoute><NotFound /></PrivateRoute>} />
            </Routes>
          </Box>
        </Container>
      </Router>
    </StacApiProvider>
  </ChakraProvider>
);

// Wrapping the App component with Keycloak provider
const WrappedApp = () => (
  <ReactKeycloakProvider authClient={keycloakInstance}>
    <App />
  </ReactKeycloakProvider>
);

export default WrappedApp;

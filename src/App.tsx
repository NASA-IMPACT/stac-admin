import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { ChakraProvider, Box, Container, Heading } from "@chakra-ui/react";
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
import { Login } from "./components/Login";
import { Groups } from "./components/Groups";
import { GroupDetails } from "./components/Groups/GroupDetails";
import { NavContainer } from "./components/NavContainer";
import ProtectedComponent from "./components/ProtectedComponent";

function NotImplemented() {
  return (
    <NavContainer activeTab="N/A">
      <Heading size="lg" fontWeight={500}>
        Not Implemented
      </Heading>
    </NavContainer>
  );
}

function AuthenticatedApp() {
  return (
    <ChakraProvider theme={theme}>
      <StacApiProvider apiUrl={process.env.REACT_APP_STAC_API!}> {/* eslint-disable-line @typescript-eslint/no-non-null-assertion */}
        <Container mx="auto" p="5" bgColor="white" boxShadow="md">
          <Box
            as="header"
            borderBottom="1px dashed"
            borderColor="gray.300"
            mb="4"
            pb="4"
            display="flex"
          >
            <Box flex="1" fontWeight="bold" textTransform="uppercase">
              STAC Admin
            </Box>
            <MainNavigation />
          </Box>
          <Box as="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collections/" element={<CollectionList />} />
              <Route path="/collections/:collectionId/" element={<CollectionDetail />} />
              <Route path="/collections/:collectionId/edit/" element={<CollectionForm />} />
              <Route path="/items/" element={<ItemList />} />
              <Route path="/collections/:collectionId/items/:itemId/" element={<ItemDetail />} />
              <Route path="/collections/:collectionId/items/:itemId/edit/" element={<ItemForm />} />
              <Route path="/groups/:id/:path" element={<ProtectedComponent Component={GroupDetails} />} />
              <Route path="/groups" element={<ProtectedComponent Component={Groups} />} />
              <Route path="/applications" element={<ProtectedComponent Component={NotImplemented} />} />
              <Route path="/users" element={<ProtectedComponent Component={NotImplemented} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </Container>
      </StacApiProvider>
    </ChakraProvider>
  );
}

export default function App() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Login />;
  }
  return (
    <BrowserRouter>
      <AuthenticatedApp />
    </BrowserRouter>
  );
}

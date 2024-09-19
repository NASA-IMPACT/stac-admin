import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import {
  ChakraProvider,
  Box,
  Button,
  Container,
} from "@chakra-ui/react";
import { ArrowRightIcon } from "@chakra-ui/icons";
import { useAuth } from "react-oidc-context";
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
import WorkflowPage from "./pages/Workflows/WorkflowPage";
import SuccessPage from "./pages/successPage";
import SorryPage from "./pages/sorryPage";
import ErrorBoundary from "./components/ErrorBoundary";

export const App = () => {
  const workflowsEnabled = process.env.REACT_APP_WORKFLOWS === "True";
  const apiUrl = process.env.REACT_APP_STAC_API;
  const auth = useAuth();

  if (!apiUrl) {
    throw new Error("REACT_APP_STAC_API is not defined");
  }

  return (
    <ChakraProvider theme={theme}>
      <StacApiProvider apiUrl={apiUrl}>
        <Router>
          <ErrorBoundary>
            <Container height="100vh" mx="auto" p="5" bgColor="white" boxShadow="md">
              {

                auth.isLoading &&
                <div>Loading...</div>
              }

              {                
                auth.error &&
                <div>Oops... {auth.error.message}</div>
              }

              {                
                auth.isAuthenticated && (!(auth.isLoading || auth.error) ) &&
                (
                  <>
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
                        <Route path="/" element={<Home />} />
                        <Route path="/collections/" element={<CollectionList />} />
                        <Route path="/collections/new_collection/" element={<CollectionForm />} />
                        <Route path="/collections/:collectionId/" element={<CollectionDetail />} />
                        <Route path="/collections/:collectionId/edit/" element={<CollectionForm />} />
                        <Route path="/items/" element={<ItemList />} />
                        <Route path="items/new_item/" element={<ItemForm />} />
                        <Route path="/success" element={<SuccessPage />} />
                        <Route path="/sorry" element={<SorryPage />} />
                        <Route path="/collections/:collectionId/items/:itemId/" element={<ItemDetail />} />
                        <Route path="/collections/:collectionId/items/:itemId/edit/" element={<ItemForm />} />
                        {workflowsEnabled && (
                          <Route path="/workflows/" element={<WorkflowPage />} />
                        )}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Box>
                  </>
                )
              }
              {
                !auth.isAuthenticated && (!(auth.isLoading || auth.error) ) &&(
                  <Button
                    type="submit"
                    onClick={() => auth.signinRedirect()}
                    rightIcon={<ArrowRightIcon />}
                  >
                    Log in
                  </Button>
                )
              }
            </Container>
          </ErrorBoundary>
        </Router>
      </StacApiProvider>
    </ChakraProvider>
  );
};

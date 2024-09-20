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
  Image,
  VStack,
  Heading,
  Text,
  Divider,
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
import backgroundImage from "./Images/background_image.png";
import loginIcon from "./Images/login_icon.png";
import nasaLogo from "./Images/NASA.svg"; // Import NASA logo SVG

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
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="96vh"
                    bgImage={`url(${backgroundImage})`}
                    bgSize="cover"
                    bgPosition="center"
                    color="black"
                    textAlign="center"
                  >
                    <VStack
                      spacing={8}
                      bg="white" // Change background to white
                      p={8}
                      borderRadius="md"
                      boxShadow="xl"
                      maxW="lg"
                      width="100%"
                      color="black" // Set text color to black
                    >
                      <Image src={nasaLogo} alt="Login Icon" boxSize="100px" />
                      <Heading size="2xl" color="black"> {/* Change text color */}
                        Welcome to STAC Admin
                      </Heading>
                      <Text fontSize="xl" maxW="sm" color="black"> {/* Change text color */}
                        Manage your spatial datasets efficiently.
                      </Text>
                      <Divider borderColor="gray.500" />
                      <Button
                        type="submit"
                        onClick={() => auth.signinRedirect()}
                        rightIcon={<ArrowRightIcon />}
                        size="lg"
                        colorScheme="gray"
                        variant="solid"
                        boxShadow="md"
                        _hover={{ boxShadow: "xl", transform: "scale(1.05)" }}
                        px={10}
                        py={8}
                        fontSize="2xl"
                        height="80px"
                        width="300px"
                        bg="#abb1ba" // Use a gray color for the button
                        color="white" // Button text color
                      >
                        <Image
                          src={loginIcon}
                          alt="Login Icon"
                          boxSize="40px" 
                          mr={4} 
                        />
                        Log in
                      </Button>
                    </VStack>
                  </Box>
                )
              }
            </Container>
          </ErrorBoundary>
        </Router>
      </StacApiProvider>
    </ChakraProvider>
  );
};

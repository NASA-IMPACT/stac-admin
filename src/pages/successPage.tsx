import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Button, CloseButton } from "@chakra-ui/react";

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { successMessage, isNewItem, selectedCollectionId, collectionId, mode } = location.state || {};

  const handleCreateNewItem = () => {
    navigate("/items/new_item/", {
      state: {
        resetForm: true,
        lastMode: mode, 
      },
    });
  };

  const handleCreateNewCollection = () => {
    navigate("/collections/new_collection/", {
      state: {
        resetForm: true,
        lastMode: mode, 
      },
    });
  };

  return (
    <Box>
      <Alert status="success" mb={4}>
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            {isNewItem ? (
              <>
                {/* If a new item or collection is created */}
                {successMessage}{" "}
                {selectedCollectionId ? (
                  <>
                    {/* For new item creation, provide link to view collection */}
                    <RouterLink to={`/collections/${selectedCollectionId}/`}>View Item</RouterLink>
                    <Box mt="2">
                      <Button variant="link" onClick={handleCreateNewItem}>
                        Create another item
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    {/* For new collection creation, provide link to view new collection */}
                    <RouterLink to={`/collections/${collectionId}/`}>View Collection</RouterLink>
                    <Box mt="2">
                      <Button variant="link" onClick={handleCreateNewCollection}>
                        Create another collection
                      </Button>
                    </Box>
                  </>
                )}
              </>
            ) : (
              <>
                {/* If an item or collection is updated */}
                {successMessage}{" "}
                {selectedCollectionId ? (
                  <>
                    {/* For item update, link to view collection */}
                    <RouterLink to={`/collections/${selectedCollectionId}/`}>View updated item</RouterLink>
                  </>
                ) : (
                  <>
                    {/* For collection update, link to view collection */}
                    <RouterLink to={`/collections/${collectionId}/`}>View updated collection</RouterLink>
                  </>
                )}
              </>
            )}
          </AlertDescription>
        </Box>
        <CloseButton position="absolute" right="8px" top="8px" />
      </Alert>
    </Box>
  );
}

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

  return (
    <Box>
      <Alert status="success" mb={4}>
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            {isNewItem ? (
              <>
                {successMessage}{" "}
                <RouterLink to={`/collections/${selectedCollectionId}/`}>View Item</RouterLink>
                <Box mt="2">
                  <Button variant="link" onClick={handleCreateNewItem}>
                    Create another item
                  </Button>
                </Box>
              </>
            ) : (
              <>
                {successMessage}{" "}
                <RouterLink to={`/collections/${collectionId}`}>View updated item</RouterLink>
              </>
            )}
          </AlertDescription>
        </Box>
        <CloseButton position="absolute" right="8px" top="8px" />
      </Alert>
    </Box>
  );
}

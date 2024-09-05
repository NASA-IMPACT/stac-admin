import { Box, Heading, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

function SorryPage() {
  const location = useLocation();
  const type = location.state?.type || "collection";  // Default to 'collection' if type is not provided

  const isCollection = type === "collection";

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading as="h2" size="xl" mb={4}>
        {isCollection ? "Sorry, this is not a valid collection." : "Sorry, this is not a valid item."}
      </Heading>
      <Text color="gray.500">
        {isCollection 
          ? "The collection you are looking for does not exist or is invalid."
          : "The item you are looking for does not exist or is invalid."}
      </Text>
    </Box>
  );
}

export default SorryPage;

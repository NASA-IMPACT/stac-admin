import { Box, Heading, Text } from "@chakra-ui/react";

function SorryPage() {
  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading as="h2" size="xl" mb={4}>
        Sorry, this is not a valid item.
      </Heading>
      <Text color="gray.500">The item you are looking for does not exist or is invalid.</Text>
    </Box>
  );
}

export default SorryPage;

import {
  Center,
  Img,
  SimpleGrid,
  Box,
  Flex,
  Text,
  Avatar,
  AvatarGroup,
  Button,
  Heading,
} from "@chakra-ui/react";
import cuate from "../../public/cuate.png";
import NASA from "../../public/NASA.svg";
import otherLogo from "../../public/otherLogo.svg";
import { useAuth } from "react-oidc-context";

interface PageTitleProps {
  children: React.ReactNode;
  size?: string;
}

const PageTitle = ({ children, size }: PageTitleProps) => {
  return (
    <Heading size={size} color="default.default" fontWeight={500}>
      {children}
    </Heading>
  );
};

export const Login = () => {
  const auth = useAuth();
  return (
    <>
      <Center height="100vh">
        <SimpleGrid columns={2} spacing={32} alignItems="center">
          <Img src={cuate} alt="cuate" maxW="400px" />

          <Box>
            <Flex gap={4} alignItems="center">
              <AvatarGroup size="md" max={2}>
                <Avatar name="NASA" src={NASA} />
                <Avatar name="Other" src={otherLogo} />
              </AvatarGroup>

              <Box>
                <Text fontWeight="bold">STAC ADMIN Auth Portal</Text>
                <Text color="gray.500" fontSize="sm">
                  Developed as a part of the STAC ADMIN project
                </Text>
              </Box>
            </Flex>

            <Box my={8}>
              <PageTitle>Welcome</PageTitle>
            </Box>

            <Button
              bg="black"
              color="white"
              _hover={{ bg: "gray.800" }}
              _active={{ bg: "gray.900" }}
              rounded="full"
              w="300px"
              onClick={() => {
                console.log("Sign in clicked");
                auth.signinRedirect();
              }}
            >
            Login
            </Button>
          </Box>
        </SimpleGrid>
      </Center>
    </>
  );
};

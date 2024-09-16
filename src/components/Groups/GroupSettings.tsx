/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Flex,
  FormControl,
  Text,
  FormLabel,
  Input,
  SimpleGrid,
  Stack,
  Divider, Button,
  Table,
  Thead,
  Tbody, Tr,
  Th,
  Td, TableContainer,
  Code,
  IconButton,
  Switch,
  useToast
} from "@chakra-ui/react";
import { PageTitle } from "../PageTitle";
import { FiTrash2 } from "react-icons/fi";
import { ActionButton } from "../ActionButton";
import { BACKEND_URL } from "../../lib/constants";
import { useEffect } from "react";
import React from "react";
import { useAuth } from "react-oidc-context";
import { Group, Member } from "../../interfaces/Groups";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface GroupSettingsProps {
  groupId: string | undefined;
}

const LeftRightLayout = ({ left, right }: { left: React.ReactNode, right: React.ReactNode }) => {
  return (
    <SimpleGrid columns={2} spacing={8}>
      <Box>
        {left}
      </Box>
      <Box>
        {right}
      </Box>
    </SimpleGrid>
  );
};

export const GroupSettings = ({ groupId }: GroupSettingsProps) => {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [owner, setOwner] = React.useState("");
  const [groupManagers, setGroupManagers] = React.useState([]);
  const [roles, setRoles] = React.useState([] as string[] | undefined);
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const customFetch = async (url: string, options?: RequestInit) => {
    const resp = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${auth?.user?.access_token}`
      }
    });

    const data = await resp.json();

    return data;
  };

  useEffect(() => {
    (async () => {
      const groupBasicInfo: Group = await customFetch(`${BACKEND_URL}/api/v1/group-management/groups/${groupId}`);
      console.log(groupBasicInfo);
      setName(groupBasicInfo.name);
      setDescription(groupBasicInfo.description);
      setOwner(groupBasicInfo.owner_id);
      setRoles(groupBasicInfo.client_roles);

      const groupMembers = await customFetch(`${BACKEND_URL}/api/v1/group-management/groups/${groupId}/members`);
      const groupManagers = groupMembers.profiles.filter((member: Member) => member.membership_type === "ADMIN");
      setGroupManagers(groupManagers);
    })();
  }, [groupId]);

  return (
    <>
      <PageTitle size="md">Group Settings</PageTitle>
      <Text color="default.secondary">Edit group membership, roles, and other information.</Text>

      <Stack border="1px solid" borderColor="border.neutral.tertiary" rounded="xl" p={8} mt={8} divider={<Divider />} spacing={8}>

        <LeftRightLayout
          left={<Text fontSize="lg">Basic Information</Text>}
          right={(
            <Stack spacing={4}>
              <FormControl color="default.default">
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormControl>
            </Stack>
          )}
        />

        <LeftRightLayout
          left={<Text fontSize="lg">Group Owner</Text>}
          right={<Stack spacing={4}><Text ml={2}>{owner}</Text></Stack>}
        />

        <LeftRightLayout
          left={(
            <>
              <Text fontSize="lg">Group Manager(s)</Text>
              <Text color="default.secondary" mt={4} fontSize="sm">Can edit the configuration for this group and add/remove members.</Text>
            </>
          )}
          right={(
            <>
              <Stack spacing={2}>
                {groupManagers.length === 0 && <Text>No group managers</Text>}
                {groupManagers.map((manager: Member) => (
                  <Flex key={manager.email} align="center" justifyContent="space-between">
                    <Text ml={2}>{manager.email}</Text>
                    <Button
                      border="1px solid"
                      borderColor="border.neutral.tertiary"
                      size="sm"
                      bg="white"
                      shadow="sm"
                      onClick={async () => {
                        const resp = await axios.delete(`${BACKEND_URL}/api/v1/group-management/groups/${groupId}/members/${manager.email}`, {
                          headers: {
                            Authorization: `Bearer ${auth.user?.access_token}`
                          }
                        });

                        if (resp.status > 199 && resp.status < 300) {
                          toast({
                            title: "Member removed",
                            status: "success",
                            duration: 2000,
                            isClosable: true
                          });
                        } else {
                          toast({
                            title: "Error removing member",
                            status: "error",
                            duration: 2000,
                            isClosable: true
                          });
                        }

                        navigate(0);
                      }}
                    >
                      Remove
                    </Button>
                  </Flex>
                ))}
              </Stack>

              <Button 
                variant="link" 
                color="blue.400" 
                size="sm" 
                mt={4}
                onClick={() => {
                  navigate(`/groups/${groupId}/members`);
                  navigate(0);
                }}
              >
                Add Manager
              </Button>
            </>
          )}
        />

        <Box>
          <Text fontSize="lg">Roles</Text>
          <Text color="default.secondary" mt={4} fontSize="sm">Choose the roles to assign to members of this group.</Text>

          <TableContainer mt={4}>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Role</Th>
                  <Th>Description</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {roles?.map((role) => (
                  <Tr key={role}>
                    <Td>
                      <Code colorScheme="gray">{role}</Code>
                    </Td>
                    <Td>
                      <IconButton
                        aria-label="Delete Role"
                        icon={<FiTrash2 />}
                        size="sm"
                        bg=""
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Button variant="link" color="blue.400" size="sm" mt={4}>Add Role</Button>
        </Box>

        <LeftRightLayout
          left={<Text fontSize="lg">Automatically add users to this group</Text>}
          right={<Flex justifyContent="flex-end"><Switch colorScheme="blackAlpha" /></Flex>}
        />
      </Stack>

      <Stack direction="row" mt={8} spacing={4}>
        <ActionButton onClick={() => {/* TODO: Add save functionality */}}>
            Save Changes
        </ActionButton>

        <Button border="1px solid" borderColor="border.neutral.secondary">Archive Group</Button>
      </Stack>
    </>
  );
};

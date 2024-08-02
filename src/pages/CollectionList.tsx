import { Link, useNavigate } from "react-router-dom";
import { TableContainer, Table, Text, Thead, Tr, Th, Td, Tbody, Box, IconButton, Icon } from "@chakra-ui/react";
import { useCollections } from "@developmentseed/stac-react";
import type { StacCollection } from "stac-ts";
import { Loading } from "../components";
import { usePageTitle } from "../hooks";
import { MdAdd } from "react-icons/md";

function CollectionList() {
  usePageTitle("Collections");
  const navigate = useNavigate();
  const { collections, state } = useCollections();

  return (
    <>
      <Box display="flex" alignItems="center">
        <Text as="h1" mr={4}>Collections</Text>
        <Link 
          to="/collections/new_collection/"
          aria-label="Add collection"
          onClick={e => e.stopPropagation()}
        >
          <IconButton
            aria-label="Add new collection"
            icon={<Icon as={MdAdd} />}
            size="md"
            border="1.5px solid black" // Add black border
            borderRadius="md" // Optional: Add border radius
          />
        </Link>
      </Box>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th aria-label="Actions" />
            </Tr>
          </Thead>
          <Tbody>
            {!collections || state === "LOADING" ? (
              <Tr>
                <Td colSpan={2}>
                  <Loading>Loading collections...</Loading>
                </Td>
              </Tr>
            ) : (
              collections.collections.map(({ id }: StacCollection) => (
                <Tr
                  key={id}
                  onClick={() => navigate(`/collections/${id}/`)}
                  _hover={{ cursor: "pointer", bgColor: "gray.50" }}
                >
                  <Td>{id}</Td>
                  <Td fontSize="sm">
                    <Link
                      to={`/collections/${id}/`}
                      aria-label={`View collection ${id}`}
                      onClick={e => e.stopPropagation()}
                    >
                      View
                    </Link>
                    {" "}|{" "}
                    <Link
                      to={`/collections/${id}/edit/`}
                      aria-label={`Edit collection ${id}`}
                      onClick={e => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}

export default CollectionList;

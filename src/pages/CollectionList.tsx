import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TableContainer, Table, Text, Thead, Tr, Th, Td, Tbody } from "@chakra-ui/react";
import axiosInstance from "../axiosInstance";
import type { StacCollection } from "stac-ts";
import { Loading } from "../components";
import { usePageTitle } from "../hooks";

function CollectionList() {
  usePageTitle("Collections");
  const navigate = useNavigate();
  const [collections, setCollections] = useState<StacCollection[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axiosInstance.get("/collections"); 
        setCollections(response.data.collections);
      } catch (error) {
        console.error("Error fetching collections", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <>
      <Text as="h1">Collections</Text>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th aria-label="Actions" />
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={2}>
                  <Loading>Loading collections...</Loading>
                </Td>
              </Tr>
            ) : (
              collections?.map(({ id }: StacCollection) => (
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </Link>
                    {" "}|{" "}
                    <Link
                      to={`/collections/${id}/edit/`}
                      aria-label={`Edit collection ${id}`}
                      onClick={(e) => e.stopPropagation()}
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

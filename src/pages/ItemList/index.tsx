import { useEffect } from "react";
import { Heading, Box, Icon, IconButton } from "@chakra-ui/react";
import { useStacSearch } from "@developmentseed/stac-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import ItemListFilter from "./ItemListFilter";
import ItemResults from "../../components/ItemResults";
import { MdAdd } from "react-icons/md";

function ItemList() {
  usePageTitle("Items");
  const { collectionId } = useParams();  // Get the collectionId from the URL params
  const {
    results,
    state,
    sortby,
    setSortby,
    limit,
    setLimit,
    submit,
    nextPage,
    previousPage,
    ...searchState
  } = useStacSearch();

  // Submit handlers and effects
  useEffect(() => {
    // Automatically submit to receive initial results
    if (results) return;
    submit();
  }, [submit]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Box display="flex" alignItems="baseline" gap="4">
        <Heading as="h1" flex="1">Items</Heading>
        <Link 
          to="/items/new_item/"
          aria-label="Add Item"
          onClick={e => e.stopPropagation()}
        >
          <IconButton
            aria-label="Add new item"
            icon={<Icon as={MdAdd} />}
            size="md"
          />
        </Link>
      </Box>
      <ItemListFilter submit={submit} {...searchState} />
      <ItemResults
        results={results}
        sortby={sortby}
        setSortby={setSortby}
        limit={limit}
        setLimit={setLimit}
        previousPage={previousPage}
        nextPage={nextPage}
        state={state}
        submit={submit}
      />
    </>
  );
}

export default ItemList;

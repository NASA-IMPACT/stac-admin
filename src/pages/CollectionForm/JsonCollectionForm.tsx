import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Textarea } from "@chakra-ui/react";
import { StacCollection } from "stac-ts";
import useUpdateCollection from "./useUpdateCollection";
import { usePageTitle } from "../../hooks";

function JsonCollectionForm() {
  const navigate = useNavigate();
  usePageTitle("Add Collection in JSON Format");
  const { update, state: updateState } = useUpdateCollection();
  const [jsonInput, setJsonInput] = useState("");

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  const handleJsonSubmit = () => {
    try {
      const parsedData: StacCollection = JSON.parse(jsonInput);
      update(parsedData, false).then(() => {
        navigate(`/collections/${parsedData.id}/`);
      });
    } catch (error) {
      console.error("Invalid JSON input");
    }
  };

  return (
    <>
      <Box>
        <Textarea
          value={jsonInput}
          onChange={handleJsonChange}
          size="md"
          minHeight="80vh"
        />
        <Box mt="4">
          <Button onClick={handleJsonSubmit} isLoading={updateState === "LOADING"}>
            Create collection
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default JsonCollectionForm;

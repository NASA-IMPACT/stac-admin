import React, { useState, useEffect } from "react";
import {
  Box, Button, Menu, MenuButton, MenuList, MenuItem, Container, Heading, Flex, Text, Input, Table, Tbody, Td, Th, Thead, Tr, IconButton, Textarea, FormControl, FormLabel, FormErrorMessage,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useForm, useFieldArray } from "react-hook-form";
import { MdAdd, MdDelete } from "react-icons/md";
import { WorkflowFormValues } from "./types"; // Import the WorkflowFormValues type

const WorkflowPage: React.FC = () => {
  const { handleSubmit, control, register, formState: { errors }, setValue, watch } = useForm<WorkflowFormValues>({
    defaultValues: {
      id: "",
      bucket: "",
      prefix: "",
      filename_regex: "",
      id_regex: "",
      id_template: "",
      datetime_range: "",
      assets: [{ title: "", description: "", regex: "" }],
      discovery: "",
      upload: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "assets",
  });

  const [selectedOption, setSelectedOption] = useState("Choose Action");
  const [isJsonMode, setIsJsonMode] = useState(false); // Toggle JSON and form view
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [showForm, setShowForm] = useState(false); // State to control form visibility

  const watchedValues = watch();

  // Synchronize the form values with the JSON input
  useEffect(() => {
    if (!isJsonMode) {
      const updatedJson = JSON.stringify(watchedValues, null, 2);
      setJsonInput(updatedJson);
    }
  }, [watchedValues, isJsonMode]);

  const handleOptionSelect = (option: string) => {
    console.log(`Selected option: ${option}`);
    setSelectedOption(option);
    setShowForm(true); // Show form when an option is selected
    setIsJsonMode(false); // Ensure starting in form mode
  };

  const onSubmit = async (data: WorkflowFormValues) => {
    console.log("Workflow executed with data:", data);
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Workflow successfully posted:", result);
    } catch (error) {
      console.error("Error posting workflow:", error);
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJson = e.target.value;
    setJsonInput(newJson);

    try {
      const parsedData = JSON.parse(newJson);
      Object.keys(parsedData).forEach((key) => {
        setValue(key as keyof WorkflowFormValues, parsedData[key]);
      });
      setJsonError("");
    } catch (error) {
      setJsonError("Invalid JSON format");
    }
  };

  const toggleJsonMode = () => {
    setIsJsonMode(!isJsonMode);
    if (!isJsonMode) {
      // Switching to JSON mode, ensure the JSON input is updated with the latest form values
      setJsonInput(JSON.stringify(watchedValues, null, 2));
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="lg">
          Workflows
        </Heading>
        {showForm && (
          <Button type="button" onClick={toggleJsonMode}>
            {isJsonMode ? "Form" : "JSON"}
          </Button>
        )}
      </Flex>
      <Box
        bg="gray.50"
        p={6}
        borderRadius="md"
        boxShadow="sm"
        mb={8}
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontSize="lg" mb={4}>
          Select a workflow:
        </Text>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {selectedOption}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleOptionSelect("Ingest from S3")}>
              Ingest from S3
            </MenuItem>
            <MenuItem onClick={() => handleOptionSelect("Copy from STAC")}>
              Copy from STAC
            </MenuItem>
            <MenuItem onClick={() => handleOptionSelect("Option C")}>
              Option C
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>

      {showForm && (
        isJsonMode ? (
          <Box
            p={6}
            borderRadius="md"
            boxShadow="sm"
            mb={8}
            border="1px solid"
            borderColor="gray.200"
            position="relative"
          >
            <Textarea
              value={jsonInput}
              onChange={handleJsonChange}
              placeholder="Edit workflow in JSON format"
              size="md"
              minHeight="430px"
            />
            {jsonError && <Text color="red.500">{jsonError}</Text>}
            <Flex justifyContent="flex-end" mt="4">
              <Button onClick={handleSubmit(() => onSubmit(JSON.parse(jsonInput)))}>
                Run Workflow
              </Button>
            </Flex>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={!!errors.id}>
              <FormLabel>ID</FormLabel>
              <Input
                placeholder="ID"
                {...register("id", { required: "Collection ID" })}
              />
              <FormErrorMessage>{errors.id && errors.id.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.bucket} mt={4}>
              <FormLabel>Bucket</FormLabel>
              <Input
                placeholder="Bucket"
                {...register("bucket", { required: "Bucket" })}
              />
              <FormErrorMessage>{errors.bucket && errors.bucket.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.prefix} mt={4}>
              <FormLabel>Prefix</FormLabel>
              <Input
                placeholder="Prefix"
                {...register("prefix", { required: "Prefix" })}
              />
              <FormErrorMessage>{errors.prefix && errors.prefix.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.filename_regex} mt={4}>
              <FormLabel>Filename Regex</FormLabel>
              <Input
                placeholder="Filename Regex"
                {...register("filename_regex", { required: "Filename Regex" })}
              />
              <FormErrorMessage>{errors.filename_regex && errors.filename_regex.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.id_regex} mt={4}>
              <FormLabel>ID Regex</FormLabel>
              <Input
                placeholder="ID Regex"
                {...register("id_regex", { required: "ID Regex" })}
              />
              <FormErrorMessage>{errors.id_regex && errors.id_regex.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.id_template} mt={4}>
              <FormLabel>ID Template</FormLabel>
              <Input
                placeholder="ID Template"
                {...register("id_template", { required: "ID Template" })}
              />
              <FormErrorMessage>{errors.id_template && errors.id_template.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.datetime_range} mt={4}>
              <FormLabel>Datetime Range</FormLabel>
              <Input
                placeholder="Datetime Range"
                {...register("datetime_range", { required: "Datetime Range" })}
              />
              <FormErrorMessage>{errors.datetime_range && errors.datetime_range.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.discovery} mt={4}>
              <FormLabel>Discovery</FormLabel>
              <Input
                placeholder="Discovery"
                {...register("discovery", { required: "Discovery" })}
              />
              <FormErrorMessage>{errors.discovery && errors.discovery.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.upload} mt={4}>
              <FormLabel>Upload</FormLabel>
              <Input
                placeholder="Upload"
                {...register("upload", { required: "Upload" })}
              />
              <FormErrorMessage>{errors.upload && errors.upload.message}</FormErrorMessage>
            </FormControl>

            <fieldset>
              <legend>Assets</legend>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Title</Th>
                    <Th>Description</Th>
                    <Th>Regex</Th>
                    <Th aria-label="Actions" />
                  </Tr>
                </Thead>
                <Tbody>
                  {fields.map((field, index) => (
                    <Tr key={field.id}>
                      <Td>
                        <Input
                          {...register(`assets.${index}.title`, { required: "Title is required" })}
                          placeholder="Title"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`assets.${index}.description`, { required: "Description is required" })}
                          placeholder="Description"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`assets.${index}.regex`, { required: "Regex is required" })}
                          placeholder="Regex"
                        />
                      </Td>
                      <Td>
                        <IconButton
                          type="button"
                          icon={<MdDelete />}
                          aria-label="Remove asset"
                          onClick={() => remove(index)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Box textAlign="right" mt="2">
                <Button
                  type="button"
                  variant="link"
                  leftIcon={<MdAdd />}
                  onClick={() => append({ title: "", description: "", regex: "" })}
                >
                  Add Asset
                </Button>
              </Box>
            </fieldset>
            <Flex justifyContent="flex-end" mt="4">
              <Button type="submit">
                Run Workflow
              </Button>
            </Flex>
          </form>
        )
      )}
    </Container>
  );
};

export default WorkflowPage;

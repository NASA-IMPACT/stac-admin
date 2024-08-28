import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Flex,
  Text,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IconButton,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stack,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useForm, useFieldArray } from "react-hook-form";
import { MdAdd, MdDelete } from "react-icons/md";
import { WorkflowFormValues } from "./types";
import { fetchLicenses, License } from "../../constants/constant";

const WorkflowPage: React.FC = () => {
  const { handleSubmit, control, register, formState: { errors }, setValue, watch } = useForm<WorkflowFormValues>({
    defaultValues: {
      collection: "",
      data_type: "",
      spatial_extent: {
        xmin: NaN,
        ymin: NaN,
        xmax: NaN,
        ymax: NaN
      },
      temporal_extent: {
        startdate: "",
        enddate: ""
      },
      stac_version: "1.0.0",
      stac_extensions: [""],
      title: "",
      description: "",
      discovery_items: [
        {
          discovery: "s3",
          collection: "",
          bucket: "",
          prefix: "",
          filename_regex: "",
          datetime_range: "year",
          assets: {
            "population-density": {
              title: "",
              description: "",
              regex: ""
            }
          },
          id_regex: "",
          id_template: ""
        }
      ],
      is_periodic: true,
      license: "",
      sample_files: [""],
      providers: [
        {
          name: "",
          roles: [""],
          url: ""
        }
      ],
      renders: {
        dashboard: {
          assets: [""],
          colormap_name: "",
          rescale: [[0, 1000]]
        }
      },
      assets: {
        thumbnail: {
          description: "",
          href: "",
          roles: [""],
          title: "",
          type: ""
        }
      },
      item_assets: {
        "population_density": {
          type: "",
          roles: [],
          title: "",
          description: ""
        }
      },
      time_density: "year"
    }
  });

  const { fields: discoveryFields, append: appendDiscovery, remove: removeDiscovery } = useFieldArray({
    control,
    name: "discovery_items",
  });

  const { fields: providerFields, append: appendProvider, remove: removeProvider } = useFieldArray({
    control,
    name: "providers",
  });

  const { fields: renderDashboardFields, append: appendRenderDashboard, remove: removeRenderDashboard } = useFieldArray({
    control,
    name: "renders.dashboard.rescale",
  });

  const [selectedOption, setSelectedOption] = useState("Choose Action");
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const watchedValues = watch();

  // Fetch licenses from SPDX
  useEffect(() => {
    const loadLicenses = async () => {
      try {
        const fetchedLicenses = await fetchLicenses();
        setLicenses(fetchedLicenses);
      } catch (error) {
        setErrorMessage("Failed to load licenses. Please try again later.");
      }
    };
    loadLicenses();
  }, []);

  useEffect(() => {
    if (!isJsonMode) {
      const updatedJson = JSON.stringify(watchedValues, null, 2);
      setJsonInput(updatedJson);
    }
  }, [watchedValues, isJsonMode]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowForm(true);
    setIsJsonMode(false);
  };

  const onSubmit = async (data: WorkflowFormValues) => {
    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");

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
      setSuccessMessage("Workflow successfully posted.");
      console.log("Workflow successfully posted:", result);
    } catch (error) {
      setErrorMessage("Error posting workflow. Please try again.");
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
      setJsonInput(JSON.stringify(watchedValues, null, 2));
    }
  };

  const handleAddItemAsset = () => {
    const newKey = `new_asset_${Date.now()}`;
    const newItemAsset = {
      type: "",
      roles: [""],
      title: "",
      description: ""
    };
    setValue(`item_assets.${newKey}`, newItemAsset);
  };

  const handleRemoveItemAsset = (key: string) => {
    const currentItemAssets = watch("item_assets");
    delete currentItemAssets[key];
    setValue("item_assets", currentItemAssets);
  };

  const handleRemoveAsset = () => {
    setValue("assets.thumbnail", {
      description: "",
      href: "",
      roles: [],
      title: "",
      type: ""
    });
  };

  const handleAddAsset = () => {
    const newAsset = {
      description: "",
      href: "",
      roles: [""],
      title: "",
      type: ""
    };
    setValue("assets.thumbnail", newAsset);
  };

  const handleRemoveSpatialExtent = () => {
    setValue("spatial_extent", {
      xmin: NaN,
      ymin: NaN,
      xmax: NaN,
      ymax: NaN
    });
  };

  const handleRemoveTemporalExtent = () => {
    setValue("temporal_extent", {
      startdate: "",
      enddate: ""
    });
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

      {successMessage && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" onClick={() => setSuccessMessage("")} />
        </Alert>
      )}

      {errorMessage && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Box>
          <CloseButton position="absolute" right="8px" top="8px" onClick={() => setErrorMessage("")} />
        </Alert>
      )}

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
            {/* Collection */ }
            <FormControl isInvalid={!!errors.collection}>
              <FormLabel>Collection</FormLabel>
              <Input
                placeholder="Collection"
                {...register("collection", { required: "Collection ID" })}
              />
              <FormErrorMessage>{errors.collection && errors.collection.message}</FormErrorMessage>
            </FormControl>

            {/* DataTypes */ }
            <FormControl isInvalid={!!errors.data_type}>
              <FormLabel>DataTypes</FormLabel>
              <Input
                placeholder="Data_Type"
                {...register("data_type", { required: "Data Types" })}
              />
              <FormErrorMessage>{errors.data_type && errors.data_type.message}</FormErrorMessage>
            </FormControl>

            {/* SpatialExtent Form */}
            <fieldset>
              <legend>Spatial Extent</legend>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>X Min</Th>
                    <Th>Y Min</Th>
                    <Th>X Max</Th>
                    <Th>Y Max</Th>
                    <Th aria-label="Actions" />
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>
                      <Input
                        {...register("spatial_extent.xmin", { required: "X Min is required" })}
                        placeholder="X Min"
                        type="number"
                      />
                    </Td>
                    <Td>
                      <Input
                        {...register("spatial_extent.ymin", { required: "Y Min is required" })}
                        placeholder="Y Min"
                        type="number"
                      />
                    </Td>
                    <Td>
                      <Input
                        {...register("spatial_extent.xmax", { required: "X Max is required" })}
                        placeholder="X Max"
                        type="number"
                      />
                    </Td>
                    <Td>
                      <Input
                        {...register("spatial_extent.ymax", { required: "Y Max is required" })}
                        placeholder="Y Max"
                        type="number"
                      />
                    </Td>
                    <Td>
                      <IconButton
                        type="button"
                        icon={<MdDelete />}
                        aria-label="Remove spatial extent"
                        onClick={handleRemoveSpatialExtent}
                      />
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </fieldset>

            {/* TemporalExtent Form */}
            <fieldset>
              <legend>Temporal Extent</legend>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Start Date</Th>
                    <Th>End Date</Th>
                    <Th aria-label="Actions" />
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>
                      <Input
                        {...register("temporal_extent.startdate", { required: "Start Date is required" })}
                        placeholder="Start Date"
                        type="date"
                      />
                    </Td>
                    <Td>
                      <Input
                        {...register("temporal_extent.enddate", { required: "End Date is required" })}
                        placeholder="End Date"
                        type="date"
                      />
                    </Td>
                    <Td>
                      <IconButton
                        type="button"
                        icon={<MdDelete />}
                        aria-label="Remove temporal extent"
                        onClick={handleRemoveTemporalExtent}
                      />
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
              <FormErrorMessage>
                {errors.temporal_extent && "Both start and end date are required"}
              </FormErrorMessage>
            </fieldset>

            {/* STAC Version */}
            <FormControl isInvalid={!!errors.stac_version} mt={4}>
              <FormLabel>STAC Version</FormLabel>
              <Input
                placeholder="STAC Version"
                {...register("stac_version", { required: "STAC Version is required" })}
              />
              <FormErrorMessage>{errors.stac_version && errors.stac_version.message}</FormErrorMessage>
            </FormControl>

            {/* STAC Extensions */}
            <FormControl isInvalid={!!errors.stac_extensions} mt={4}>
              <FormLabel>STAC Extensions</FormLabel>
              <Input
                placeholder="STAC Extensions"
                {...register("stac_extensions.0", { required: "STAC Extensions are required" })}
              />
              <Input
                placeholder="STAC Extensions"
                {...register("stac_extensions.1", { required: "STAC Extensions are required" })}
              />
              <FormErrorMessage>{errors.stac_extensions && errors.stac_extensions.message}</FormErrorMessage>
            </FormControl>

            {/* Title */}
            <FormControl isInvalid={!!errors.title} mt={4}>
              <FormLabel>Title</FormLabel>
              <Input
                placeholder="Title"
                {...register("title", { required: "Title is required" })}
              />
              <FormErrorMessage>{errors.title && errors.title.message}</FormErrorMessage>
            </FormControl>

            {/* Description */}
            <FormControl isInvalid={!!errors.description} mt={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Description"
                {...register("description", { required: "Description is required" })}
              />
              <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
            </FormControl>

            {/* Discovery Items */}
            <fieldset>
              <legend>Discovery Items</legend>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Discovery</Th>
                    <Th>Collection</Th>
                    <Th>Bucket</Th>
                    <Th>Prefix</Th>
                    <Th>Filename Regex</Th>
                    <Th>Datetime Range</Th>
                    <Th>ID Regex</Th>
                    <Th>ID Template</Th>
                    <Th aria-label="Actions" />
                  </Tr>
                </Thead>
                <Tbody>
                  {discoveryFields.map((field, index) => (
                    <Tr key={field.id}>
                      <Td>
                        <Input
                          {...register(`discovery_items.${index}.discovery`, { required: "Discovery is required" })}
                          placeholder="Discovery"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`discovery_items.${index}.collection`, { required: "Collection is required" })}
                          placeholder="Collection"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`discovery_items.${index}.bucket`, { required: "Bucket is required" })}
                          placeholder="Bucket"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`discovery_items.${index}.prefix`, { required: "Prefix is required" })}
                          placeholder="Prefix"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`discovery_items.${index}.filename_regex`, { required: "Filename Regex is required" })}
                          placeholder="Filename Regex"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`discovery_items.${index}.datetime_range`, { required: "Datetime Range is required" })}
                          placeholder="Datetime Range"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`discovery_items.${index}.id_regex`, { required: "ID Regex is required" })}
                          placeholder="ID Regex"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`discovery_items.${index}.id_template`, { required: "ID Template is required" })}
                          placeholder="ID Template"
                        />
                      </Td>
                      <Td>
                        <IconButton
                          type="button"
                          icon={<MdDelete />}
                          aria-label="Remove discovery item"
                          onClick={() => removeDiscovery(index)}
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
                  onClick={() => appendDiscovery({
                    discovery: "",
                    collection: "",
                    bucket: "",
                    prefix: "",
                    filename_regex: "",
                    datetime_range: "year",
                    assets: {
                      "population-density": {
                        title: "",
                        description: "",
                        regex: ""
                      }
                    },
                    id_regex: "",
                    id_template: ""
                  })}
                >
                  Add Discovery Item
                </Button>
              </Box>
            </fieldset>

            {/* Is Periodic */ }
            <FormControl isInvalid={!!errors.is_periodic}>
              <FormLabel>Is Periodic</FormLabel>
              <Input
                placeholder="is_periodic"
                {...register("is_periodic", { required: "Is Periodic" })}
              />
              <FormErrorMessage>{errors.is_periodic && errors.is_periodic.message}</FormErrorMessage>
            </FormControl>

            {/* License */}
            <FormControl isInvalid={!!errors.license} mt={4}>
              <FormLabel>License</FormLabel>
              <Select
                placeholder="Select License"
                {...register("license", { required: "License is required" })}
              >
                {licenses.map((license) => (
                  <option key={license.licenseId} value={license.licenseId}>
                    {license.licenseId} - {license.name}
                  </option>
                ))}
                <option value="other">Other</option>
              </Select>
              <FormErrorMessage>{errors.license && errors.license.message}</FormErrorMessage>
            </FormControl>

            {/* Sample Files */}
            <FormControl isInvalid={!!errors.sample_files} mt={4}>
              <FormLabel>sample_files</FormLabel>
              <Input
                placeholder="sample_files"
                {...register("sample_files", { required: "Sample file is required" })}
              />
              <FormErrorMessage>{errors.sample_files && errors.sample_files.message}</FormErrorMessage>
            </FormControl>

            {/* Providers */}
            <fieldset>
              <legend>Providers</legend>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Roles</Th>
                    <Th>URL</Th>
                    <Th aria-label="Actions" />
                  </Tr>
                </Thead>
                <Tbody>
                  {providerFields.map((field, index) => (
                    <Tr key={field.id}>
                      <Td>
                        <Input
                          {...register(`providers.${index}.name`, { required: "Name is required" })}
                          placeholder="Name"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`providers.${index}.roles.0`, { required: "Role is required" })}
                          placeholder="Role"
                        />
                      </Td>
                      <Td>
                        <Input
                          {...register(`providers.${index}.url`, { required: "URL is required" })}
                          placeholder="URL"
                        />
                      </Td>
                      <Td>
                        <IconButton
                          type="button"
                          icon={<MdDelete />}
                          aria-label="Remove provider"
                          onClick={() => removeProvider(index)}
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
                  onClick={() => appendProvider({
                    name: "",
                    roles: [""],
                    url: ""
                  })}
                >
                  Add Provider
                </Button>
              </Box>
            </fieldset>

            {/* Render Dashboard */}
            <fieldset>
              <legend>Render Dashboard Rescale</legend>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Min Value</Th>
                    <Th>Max Value</Th>
                    <Th aria-label="Actions" />
                  </Tr>
                </Thead>
                <Tbody>
                  {renderDashboardFields.map((field, index) => (
                    <Tr key={field.id}>
                      <Td>
                        <Input
                          type="number"
                          {...register(`renders.dashboard.rescale.${index}.0`, { required: "Min value is required" })}
                          placeholder="Min Value"
                        />
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          {...register(`renders.dashboard.rescale.${index}.1`, { required: "Max value is required" })}
                          placeholder="Max Value"
                        />
                      </Td>
                      <Td>
                        <IconButton
                          type="button"
                          icon={<MdDelete />}
                          aria-label="Remove rescale range"
                          onClick={() => removeRenderDashboard(index)}
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
                  onClick={() => appendRenderDashboard([0, 0])}
                >
                  Add Rescale Range
                </Button>
              </Box>
            </fieldset>

            {/* Assets - Thumbnail */}
            <fieldset>
              <legend>Assets</legend>
              <Box mb={4}>
                <FormControl isInvalid={!!errors.assets?.thumbnail}>
                  <FormLabel>Description</FormLabel>
                  <Input
                    placeholder="Description"
                    {...register("assets.thumbnail.description", { required: "Description is required" })}
                  />
                  <FormLabel>Href</FormLabel>
                  <Input
                    placeholder="Href"
                    {...register("assets.thumbnail.href", { required: "Href is required" })}
                  />
                  <FormLabel>Roles</FormLabel>
                  <Input
                    placeholder="Roles"
                    {...register("assets.thumbnail.roles.0", { required: "Role is required" })}
                  />
                  <FormLabel>Title</FormLabel>
                  <Input
                    placeholder="Title"
                    {...register("assets.thumbnail.title", { required: "Title is required" })}
                  />
                  <FormLabel>Type</FormLabel>
                  <Input
                    placeholder="Type"
                    {...register("assets.thumbnail.type", { required: "Type is required" })}
                  />
                  {/* Added: Remove Asset Button */}
                  <IconButton
                    mt={2}
                    type="button"
                    icon={<MdDelete />}
                    aria-label="Remove asset"
                    onClick={handleRemoveAsset}
                  />
                  <FormErrorMessage>{errors.assets?.thumbnail && "All asset fields are required"}</FormErrorMessage>
                </FormControl>
              </Box>
              <Box textAlign="right" mt="2">
                <Button
                  type="button"
                  variant="link"
                  leftIcon={<MdAdd />}
                  onClick={handleAddAsset}
                >
                  Add Asset
                </Button>
              </Box>
            </fieldset>

            {/* Item Assets */}
            <fieldset>
              <legend>Item Assets</legend>
              {Object.keys(watch("item_assets")).map((key) => (
                <Box key={key} mb={4}>
                  <FormControl isInvalid={!!errors.item_assets}>
                    <FormLabel>Type</FormLabel>
                    <Input
                      placeholder="Type"
                      {...register(`item_assets.${key}.type`, { required: "Type is required" })}
                    />
                    <FormLabel>Roles</FormLabel>
                    <Input
                      placeholder="Roles"
                      {...register(`item_assets.${key}.roles.0`, { required: "Role is required" })}
                    />
                    <FormLabel>Title</FormLabel>
                    <Input
                      placeholder="Title"
                      {...register(`item_assets.${key}.title`, { required: "Title is required" })}
                    />
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      placeholder="Description"
                      {...register(`item_assets.${key}.description`, { required: "Description is required" })}
                    />
                    <IconButton
                      mt={2}
                      type="button"
                      icon={<MdDelete />}
                      aria-label="Remove item asset"
                      onClick={() => handleRemoveItemAsset(key)}
                    />
                    <FormErrorMessage>{errors.item_assets && errors.item_assets[key] && "All item asset fields are required"}</FormErrorMessage>
                  </FormControl>
                </Box>
              ))}
              <Box textAlign="right" mt="2">
                <Button
                  type="button"
                  variant="link"
                  leftIcon={<MdAdd />}
                  onClick={handleAddItemAsset}
                >
                  Add Item Asset
                </Button>
              </Box>
            </fieldset>

            {/* Time Density */}
            <FormControl isInvalid={!!errors.time_density} mt={4}>
              <FormLabel>Time Density</FormLabel>
              <Input
                placeholder="Time Density"
                {...register("time_density", { required: "Time Density is required" })}
              />
              <FormErrorMessage>{errors.time_density && errors.time_density.message}</FormErrorMessage>
            </FormControl>

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

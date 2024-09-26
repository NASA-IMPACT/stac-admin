import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useItem, useCollections } from "@developmentseed/stac-react";
import {
  Box,
  Button,
  Text,
  Input,
  Textarea,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  IconButton,
  RadioGroup,
  Stack,
  Radio,
  Select,
  Alert,
  AlertDescription,
  AlertTitle,
  CloseButton,
  AlertIcon,
} from "@chakra-ui/react";
import { MdDelete, MdAdd } from "react-icons/md";
import { FormValues } from "./types";
import { Loading, HeadingLead } from "../../components";
import useUpdateItem from "./useUpdateItem";
import Api from "../../api";
import { usePageTitle } from "../../hooks";
import { StacCollection, StacItem } from "stac-ts";
import { fetchLicenses, License } from "../../services/licenseService";

import {
  TextInput,
  TextAreaInput,
  NumberInput,
  ArrayInput,
  CheckboxField,
  DateTimeInput,
} from "../../components/forms";

interface ApiErrorDetail {
  code?: string;
  description?: string | { msg: string }[];
  errors?: string | { msg: string }[];
  detail?: string;
}

interface ApiError extends Error {
  detail?: ApiErrorDetail;
}

// Define default values with necessary adjustments
const defaultValues: FormValues = {
  id: "",
  type: "Feature",
  stac_version: "1.0.0",
  stac_extensions: [],
  collection: "",
  links: [],
  assets: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ],
    ],
  },
  bbox: [0, 0, 0, 0],
  properties: {
    title: "",
    description: "",
    license: "",
    providers: [
      {
        name: "",
        description: "",
        roles: [],
        url: "",
      },
    ],
    platform: "",
    constellation: "",
    mission: "",
    gsd: 1,
    instruments: [],
    datetime: null,
    start_datetime: "",
    end_datetime: "",
    created: "",
    updated: "",
  },
};

// Utility function to format datetime strings
const formatDatetime = (datetime: string) => {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(datetime)) {
    // Format yyyy-MM-ddThh:mm -> yyyy-MM-ddThh:mm:00Z
    return `${datetime}:00Z`;
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}$/.test(datetime)) {
    // Format yyyy-MM-ddThh -> yyyy-MM-ddThh:00:00Z
    return `${datetime}:00:00Z`;
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(datetime)) {
    // Format yyyy-MM-ddThh:mm:ss -> yyyy-MM-ddThh:mm:ssZ
    return `${datetime}Z`;
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/.test(datetime)) {
    // Format yyyy-MM-ddThh:mm:ss.SSS -> yyyy-MM-ddThh:mm:ss.SSSZ
    return `${datetime}Z`;
  }
  return datetime; // If already in correct format, return as is
};

// Function to format datetime for input fields
const formatDatetimeForInput = (datetime: string) => {
  return formatDatetime(datetime).replace(/([+-]\d{2}:\d{2}|Z)$/, "");
};

export default function ItemForm() {
  const { collectionId, itemId } = useParams();
  const isNewItem = !itemId;
  const navigate = useNavigate();
  const location = useLocation();

  usePageTitle(isNewItem ? "Add New Item" : `Edit item ${itemId}`);
  const { item, state, reload } = useItem(
    isNewItem ? "" : `${process.env.REACT_APP_STAC_API}/collections/${collectionId}/items/${itemId}`
  );
  const { update, state: updateState } = useUpdateItem(
    isNewItem ? "" : `${process.env.REACT_APP_STAC_API}/collections/${collectionId}/items/${itemId}`
  );
  const { collections } = useCollections();

  useEffect(() => {
    if (location.state?.resetForm) {
      setJsonMode(location.state.lastMode === "json");
    }
  }, [location.state]);

  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(collectionId || "");
  const [isJsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | JSX.Element | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: isNewItem ? defaultValues : (item as FormValues),
    values: !isNewItem ? (item as FormValues) : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties.providers",
  });

  const watchedValues = watch();

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

  const handleRangeUpdate = (v?: string) => {
    if (v) {
      setValue("properties.datetime", null);
      return formatDatetime(v); // Use utility function to format
    }
    return v;
  };

  const handleSingleDateUpdate = (v?: string) => {
    if (v) {
      setValue("properties.start_datetime", undefined);
      setValue("properties.end_datetime", undefined);
      return formatDatetime(v); // Use utility function to format
    }
    return null;
  };

  useEffect(() => {
    if (!item || isNewItem) return;

    const { start_datetime, end_datetime, datetime } = item.properties;
    if (start_datetime && end_datetime) {
      setDateType("range");
      setValue("properties.start_datetime", formatDatetimeForInput(start_datetime));
      setValue("properties.end_datetime", formatDatetimeForInput(end_datetime));
    } else {
      setDateType("single");
      setValue("properties.datetime", formatDatetimeForInput(datetime));
    }
  }, [item, setValue, isNewItem]);

  // Function to generate the links dynamically based on form values
  const generateLinks = (data: FormValues) => {
    return [
      {
        rel: "collection",
        type: "application/json",
        href: `${process.env.REACT_APP_STAC_API}/collections/${selectedCollectionId}`
      },
      {
        rel: "parent",
        type: "application/json",
        href: `${process.env.REACT_APP_STAC_API}/collections/${selectedCollectionId}`
      },
      {
        rel: "root",
        type: "application/json",
        href: `${process.env.REACT_APP_STAC_API}/`
      },
      {
        rel: "self",
        type: "application/geo+json",
        href: `${process.env.REACT_APP_STAC_API}/collections/${selectedCollectionId}/items/${data.id}`
      }
    ];
  };

  const currentDate = new Date().toISOString();

  const onSubmit = async (data: FormValues) => {
    setSuccessMessage("");
    setErrorMessage("");

    // Format datetime fields for submission
    const formattedData = {
      ...data,
      links: generateLinks(data), // Add dynamically generated links
      properties: {
        ...data.properties,
        created: isNewItem ? currentDate : data.properties.created, // Set 'created' only if it's a new item
        updated: currentDate, // Always set 'updated' to the current date
        datetime: data.properties.datetime ? formatDatetime(data.properties.datetime) : null,
        start_datetime: data.properties.start_datetime ? formatDatetime(data.properties.start_datetime) : null,
        end_datetime: data.properties.end_datetime ? formatDatetime(data.properties.end_datetime) : null,
      },
    };

    try {
      if (isNewItem) {
        const postUrl = `${process.env.REACT_APP_STAC_API}/collections/${selectedCollectionId}/items`;

        await Api.fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        });
        navigate("/success", {
          state: {
            successMessage: `Successfully created the new item in collection ${selectedCollectionId}.`,
            isNewItem: true,
            selectedCollectionId,
            mode: isJsonMode ? "json" : "form",
          },
        });
      } else {
        const coercedData = formattedData as StacItem;
        await update(coercedData);
        navigate("/success", {
          state: {
            successMessage: `Successfully updated the item ${data.id}.`,
            isNewItem: false,
            collectionId,
            mode: isJsonMode ? "json" : "form",
          },
        });
      }
      reload();
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.detail) {
        const errorDetails = apiError.detail;
        const action = isNewItem ? "creating" : "editing";
        if (errorDetails.code && errorDetails.description) {
          setErrorMessage(
            <Box>
              <Text fontWeight="bold">Detail: {errorDetails.code}</Text>
              <Text fontWeight="bold">Description: Validation failed for item with ID {data.id || "Unknown"} while {action} it.</Text>
              <Box as="ul" pl={5}>
                {Array.isArray(errorDetails.description) ? (
                  errorDetails.description.map((desc: { msg: string }) => (
                    <Text as="li" key={Math.random().toString(36).substr(2, 9)}>
                      {desc.msg}
                    </Text>
                  ))
                ) : (
                  <Text>{errorDetails.description}</Text>
                )}
              </Box>
            </Box>
          );
        } else if (errorDetails.detail && errorDetails.errors) {
          setErrorMessage(
            <Box>
              <Text fontWeight="bold">Detail: {errorDetails.detail || "Unknown Error"}</Text>
              <Text fontWeight="bold">Description: Validation failed for item with ID {data.id || "Unknown"} while {action} it.</Text>
              <Box as="ul" pl={5}>
                {Array.isArray(errorDetails.errors) ? (
                  errorDetails.errors.map((err: { msg: string }) => (
                    <Text as="li" key={Math.random().toString(36).substr(2, 9)}>{err.msg}</Text>
                  ))
                ) : (
                  <Text>{errorDetails.errors}</Text>
                )}
              </Box>
            </Box>
          );
        } else if (errorDetails.detail) {
          setErrorMessage(
            <Box>
              <Text fontWeight="bold">
                Validation failed for item with ID {data.id || "Unknown"} while {action} it.
              </Text>
              <Text>{errorDetails.detail}</Text>
            </Box>
          );
        } else {
          setErrorMessage(JSON.stringify(errorDetails, null, 2));
        }
      } else {
        setErrorMessage("Unknown error occurred. Please try again.");
      }
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJson = e.target.value;
    setJsonInput(newJson);

    try {
      const parsedData = JSON.parse(newJson);
      Object.keys(parsedData).forEach((key) => {
        if (key === "bbox") {
          // Convert bbox values to numbers
          setValue(key as keyof FormValues, parsedData[key].map((val: string) => parseFloat(val)));
        } else {
          setValue(key as keyof FormValues, parsedData[key]);
        }
      });
      setSelectedCollectionId(parsedData.collection || "");
      setValue("properties.license", parsedData.properties?.license || "");
      setJsonError("");
    } catch (error) {
      setJsonError("Invalid JSON format");
    }
  };

  const toggleJsonMode = () => {
    setJsonMode(!isJsonMode);
    if (!isJsonMode) {
      // Include dynamically generated links in JSON before switching to JSON mode
      const updatedJson = JSON.stringify({ ...watchedValues, links: generateLinks(watchedValues) }, null, 2);
      setJsonInput(updatedJson);
    } else {
      setSelectedCollectionId(watchedValues.collection || "");
      setValue("properties.license", watchedValues.properties?.license || "");
    }
  };

  const [dateType, setDateType] = useState<string>();

  useEffect(() => {
    if (isNewItem) {
      setValue("collection", selectedCollectionId);
    }
  }, [selectedCollectionId, setValue, isNewItem]);

  if (state === "LOADING" && !isNewItem) {
    return <Loading>Loading item...</Loading>;
  }

  return (
    <>
      {successMessage && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              {successMessage}{" "}
              <Box mt="2">
                <Button variant="link" onClick={() => window.location.reload()}>
                  Create another item
                </Button>
              </Box>
            </AlertDescription>
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

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text as="h1">
          <HeadingLead>{isNewItem ? "Add New Item" : `Edit Item ${item?.id}`}</HeadingLead>
        </Text>
        <Button type="button" onClick={toggleJsonMode}>
          {isJsonMode ? "Form" : "JSON"}
        </Button>
      </Box>

      {isJsonMode ? (
        <Box>
          <Textarea value={jsonInput} onChange={handleJsonChange} placeholder="Enter item in JSON format" size="md" minHeight="80vh" />
          {jsonError && <Text color="red.500">{jsonError}</Text>}
          <Box mt="4">
            <Button onClick={handleSubmit(() => onSubmit(JSON.parse(jsonInput)))} isLoading={updateState === "LOADING"}>
              {isNewItem ? "Create Item" : "Save Item"}
            </Button>
          </Box>
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Text as="h2">Common Meta Data</Text>
          <TextInput label="Title" error={errors.properties?.title} {...register("properties.title")} />
          <TextAreaInput label="Description" error={errors.properties?.description} {...register("properties.description")} />

          <Box>
            <label htmlFor="license">License</label>
            <Controller
              name="properties.license"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select {...field} id="license" overflowY="auto" value={field.value as string | undefined}>
                  <option value="" disabled>
                    Select a license
                  </option>
                  {licenses.map((license) => (
                    <option key={license.licenseId} value={license.licenseId}>
                      {license.licenseId} - {license.name}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </Select>
              )}
            />
            {errors.properties?.license && <Text color="red.500">{errors.properties.license.message}</Text>}
          </Box>

          <fieldset>
            <legend>Date</legend>
            <RadioGroup onChange={setDateType} value={dateType}>
              <Stack direction="row">
                <Radio value="single">Single date</Radio>
                <Radio value="range">Date range</Radio>
              </Stack>
            </RadioGroup>
            <Box aria-hidden={dateType !== "single"} display={dateType === "single" ? "block" : "none"}>
              <DateTimeInput
                label="Enter date"
                error={errors.properties?.datetime}
                {...register("properties.datetime", {
                  setValueAs: handleSingleDateUpdate,
                })}
              />
            </Box>
            <Box aria-hidden={dateType === "single"} display={dateType !== "single" ? "flex" : "none"} gap="4">
              <DateTimeInput
                label="Date/time from"
                error={errors.properties?.start_datetime}
                {...register("properties.start_datetime", {
                  setValueAs: handleRangeUpdate,
                })}
              />
              <DateTimeInput
                label="Date/time to"
                error={errors.properties?.end_datetime}
                {...register("properties.end_datetime", {
                  setValueAs: handleRangeUpdate,
                })}
              />
            </Box>
          </fieldset>

          {/* BBox Input */}
          <Box mt={4}>
            <Text as="h2" fontWeight="bold">
              Bounding Box (Bbox)
            </Text>
            <Box display="flex" gap="4" mt="2">
              <NumberInput label="Min X" error={errors.bbox?.[0]} {...register("bbox.0", { required: "Min X is required", setValueAs: (v) => parseFloat(v) })} />
              <NumberInput label="Min Y" error={errors.bbox?.[1]} {...register("bbox.1", { required: "Min Y is required", setValueAs: (v) => parseFloat(v) })} />
              <NumberInput label="Max X" error={errors.bbox?.[2]} {...register("bbox.2", { required: "Max X is required", setValueAs: (v) => parseFloat(v) })} />
              <NumberInput label="Max Y" error={errors.bbox?.[3]} {...register("bbox.3", { required: "Max Y is required", setValueAs: (v) => parseFloat(v) })} />
            </Box>
          </Box>

          <fieldset>
            <legend>Providers</legend>

            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th id="provider_name">Name</Th>
                  <Th id="provider_description">Description</Th>
                  <Th id="provider_roles">Roles</Th>
                  <Th id="provider_url">URL</Th>
                  <Th aria-label="Actions" />
                </Tr>
              </Thead>
              <Tbody>
                {fields.map(({ id }, idx: number) => (
                  <Tr key={id}>
                    <Td>
                      <Input {...register(`properties.providers.${idx}.name`)} aria-labelledby="provider_name" />
                    </Td>
                    <Td>
                      <Input {...register(`properties.providers.${idx}.description`)} aria-labelledby="provider_description" />
                    </Td>
                    <Td>
                      <Controller
                        name={`properties.providers.${idx}.roles`}
                        render={({ field }) => (
                          <CheckboxField
                            aria-labelledby="provider_roles"
                            options={[
                              { value: "licensor", label: "Licensor" },
                              { value: "producer", label: "Producer" },
                              { value: "processor", label: "Processor" },
                              { value: "host", label: "Host" },
                            ]}
                            {...field}
                          />
                        )}
                        control={control}
                      />
                    </Td>
                    <Td>
                      <Input {...register(`properties.providers.${idx}.url`)} aria-labelledby="provider_url" />
                    </Td>
                    <Td>
                      <IconButton type="button" size="sm" icon={<MdDelete />} onClick={() => remove(idx)} aria-label="Remove provider" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Box textAlign="right" mt="2">
              <Button type="button" variant="link" leftIcon={<MdAdd />} onClick={() => append({ name: "" })}>
                Add provider
              </Button>
            </Box>
          </fieldset>

          {isNewItem && (
            <>
              <Text as="h2">Item Meta Data</Text>
              <TextInput label="Item ID" error={errors.id} {...register("id", { required: "Item ID is required" })} />
              <Box mt={4}>
                <Text as="label" fontWeight="bold">
                  Select Collection
                </Text>
                <Select placeholder="Select collection" value={selectedCollectionId} onChange={(e) => setSelectedCollectionId(e.target.value)} isRequired>
                  {collections?.collections.map((col: StacCollection) => (
                    <option key={col.id} value={col.id}>
                      {col.id}
                    </option>
                  ))}
                </Select>
              </Box>

              <TextInput label="STAC Version" error={errors.stac_version} {...register("stac_version")} />
            </>
          )}

          <Text as="h2">Instruments</Text>
          <TextInput label="Platform" error={errors.properties?.platform} {...register("properties.platform")} />
          <Controller
            name="properties.instruments"
            render={({ field }) => (
              <ArrayInput
                label="Instruments"
                error={errors.properties?.instruments}
                helper="Enter a comma-separated list of sensors used in the creation of the data."
                {...field}
              />
            )}
            control={control}
          />
          <TextInput label="Constellation" error={errors.properties?.constellation} {...register("properties.constellation")} />
          <TextInput label="Mission" error={errors.properties?.mission} {...register("properties.mission")} />
          <NumberInput label="Ground Sample Distance" error={errors.properties?.gsd} {...register("properties.gsd", { min: 1 })} />

          <Box mt="4">
            <Button type="submit" isLoading={updateState === "LOADING"}>
              {isNewItem ? "Create Item" : "Save Item"}
            </Button>
          </Box>
        </form>
      )}
    </>
  );
}

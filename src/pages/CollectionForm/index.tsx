import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Textarea,
  Text,
  Input,
  Select,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { MdAdd, MdDelete } from "react-icons/md";
import { useParams, Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useCollection } from "@developmentseed/stac-react";
import { fetchLicenses, License } from "../../services/licenseService";
import useUpdateCollection from "./useUpdateCollection";
import { HeadingLead } from "../../components/HeadingLead";
import { TextInput, TextAreaInput, ArrayInput, CheckboxField, DateTimeInput } from "../../components/forms";
import { StacCollection } from "stac-ts";
import { FormValues } from "./types";
import { usePageTitle } from "../../hooks";
import { defaultData } from "./constants/updateDataDefaultValue";

interface ApiErrorDetail {
  code?: string;
  description?: string | { msg: string }[];
  errors?: string | { msg: string }[];
  detail?: string;
}

interface ApiError extends Error {
  detail?: ApiErrorDetail;
}

function CollectionForm() {
  const { collectionId } = useParams();
  const isEditMode = !!collectionId;
  const navigate = useNavigate();
  const location = useLocation();
  usePageTitle(isEditMode ? `Edit collection ${collectionId}` : "Add new collection");

  useEffect(() => {
    if (location.state?.resetForm) {
      setJsonMode(location.state.lastMode === "json");
    }
  }, [location.state]);

  const { collection, reload } = useCollection(collectionId || "");
  const { update, state: updateState } = useUpdateCollection();
  const [isJsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [licenses, setLicenses] = useState<License[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | JSX.Element>("");
  const [successMessage, setSuccessMessage] = useState("");
  const [newCollectionId, setNewCollectionId] = useState<string | null>(null);

  const { control, register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    defaultValues: isEditMode ? collection : defaultData,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "providers" });

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

  // Function to update date format to the desired format "YYYY-MM-DDTHH:MM:SSZ"
  const handleRangeUpdate = (v?: string) => {
    if (!v) return v;
    
    const date = new Date(v);
    
    // Check if the input is a valid date
    if (isNaN(date.getTime())) {
      return v; // Return the original input if it's not a valid date
    }
    
    // Convert to ISO string and remove the milliseconds part
    return date.toISOString().split(".")[0] + "Z";
  };

  useEffect(() => {
    if (!collection || isEditMode) return;

    const { start_datetime, end_datetime } = collection.extent.temporal.interval[0] || {};
    if (start_datetime && end_datetime) {
      setValue("extent.temporal.interval[0][0]", handleRangeUpdate(start_datetime));
      setValue("extent.temporal.interval[0][1]", handleRangeUpdate(end_datetime));
    }
  }, [collection, setValue, isEditMode]);
  
  const onSubmit = async (data: StacCollection) => {
    setSuccessMessage("");
    setErrorMessage("");
    const collectionId = data.id;
    try {
      const updatedCollection = await update(data, isEditMode);
      setSuccessMessage(`Successfully ${isEditMode ? "updated" : "created"} the collection with ID: ${updatedCollection.id}`);
      setNewCollectionId(collectionId);
      navigate("/success", {
        state: {
          successMessage: `Successfully ${isEditMode ? "updated" : "created"} collection ${collectionId}.`,
          isNewItem: !isEditMode,
          collectionId: updatedCollection.id,
          mode: isJsonMode ? "json" : "form",
        },
      });
      reload();
    } catch (error: unknown) {
      const apiError = error as ApiError;

      if (apiError.detail) {
        const errorDetails = apiError.detail;
        const action = isEditMode ? "editing" : "creating";

        if (errorDetails.code && errorDetails.description) {
          setErrorMessage(
            <Box>
              <Text fontWeight="bold">Detail: {errorDetails.code || "Unknown Error"}</Text>
              <Text fontWeight="bold">Description: Validation failed for collection with ID {collectionId || "Unknown"} while {action} it.</Text>
              <Box as="ul" pl={5}>
                {Array.isArray(errorDetails.description) ? (
                  errorDetails.description.map((desc: { msg: string }) => (
                    <Text as="li" key={Math.random().toString(36).substr(2, 9)}>{desc.msg}</Text>
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
              <Text fontWeight="bold">Detail: {errorDetails.code || "Unknown Error"}</Text>
              <Text fontWeight="bold">Description: Validation failed for collection with ID {collectionId || "Unknown"} while {action} it.</Text>
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
                Validation failed for collection with ID {collectionId || "Unknown"} while {action} it.
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
        setValue(key as keyof FormValues, parsedData[key]);
      });
      setJsonError("");
    } catch (error) {
      setJsonError("Invalid JSON format");
    }
  };

  const toggleJsonMode = () => {
    setJsonMode(!isJsonMode);
    if (!isJsonMode) {
      setJsonInput(JSON.stringify({ ...defaultData, ...watchedValues }, null, 2));
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text as="h1">
          <HeadingLead>{isEditMode ? "Edit Collection" : "Add New Collection"}</HeadingLead> {isEditMode && collection?.id}
        </Text>
        <Button type="button" onClick={toggleJsonMode}>
          {isJsonMode ? "Form" : "JSON"}
        </Button>
      </Box>

      {successMessage && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              {isEditMode ? (
                <>
                  Successfully updated the{" "}
                  <RouterLink to={`/collections/${collectionId}`}>
                    {collectionId}
                  </RouterLink>.
                </>
              ) : (
                <>
                  Successfully created collection{" "}
                  <RouterLink to={`/collections/${newCollectionId}`}>
                    {newCollectionId}
                  </RouterLink>.
                  <Box mt="2">
                    <Button variant="link" onClick={() => window.location.reload()}>
                      Create another collection
                    </Button>
                  </Box>
                </>
              )}
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

      {isJsonMode ? (
        <Box>
          <Textarea
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder="Enter collection in JSON format"
            size="md"
            minHeight="80vh"
          />
          {jsonError && <Text color="red.500">{jsonError}</Text>}
          <Box mt="4">
            <Button onClick={handleSubmit(() => onSubmit(JSON.parse(jsonInput)))} isLoading={updateState === "LOADING"}>
              {isEditMode ? "Save collection" : "Create collection"}
            </Button>
          </Box>
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {!isEditMode && (
            <TextInput label="ID" error={errors.id} {...register("id", { required: "Enter a collection ID." })} />
          )}
          <TextInput label="Title" error={errors.title} {...register("title")} />
          <TextAreaInput label="Description" error={errors.description} {...register("description", { required: "Enter a collection description." })} />

          {/* Bounding Box fields */}
          <Box>
            <Text mt="4">Bounding Box</Text>
            <Box display="flex" gap="2">
              <Box>
                <Text>Min X</Text>
                <Input {...register("extent.spatial.bbox[0][0]", { required: "Min X is required." })} />
              </Box>
              <Box>
                <Text>Min Y</Text>
                <Input {...register("extent.spatial.bbox[0][1]", { required: "Min Y is required." })} />
              </Box>
              <Box>
                <Text>Max X</Text>
                <Input {...register("extent.spatial.bbox[0][2]", { required: "Max X is required." })} />
              </Box>
              <Box>
                <Text>Max Y</Text>
                <Input {...register("extent.spatial.bbox[0][3]", { required: "Max Y is required." })} />
              </Box>
            </Box>
            {errors.extent?.spatial && <Text color="red.500">All bounding box fields are required.</Text>}
          </Box>

          {/* Temporal Extent fields */}
          <Box>
            <Text mt="4">Temporal Extent</Text>
            <Box display="flex" gap="4">
              <DateTimeInput
                label="Date/time from"
                {...register("extent.temporal.interval[0][0]", {
                  setValueAs: handleRangeUpdate,
                  required: "Start date/time is required."
                })}
              />
              <DateTimeInput
                label="Date/time to"
                {...register("extent.temporal.interval[0][1]", {
                  setValueAs: handleRangeUpdate,
                  required: "End date/time is required."
                })}
              />
            </Box>
            {errors.extent?.temporal && <Text color="red.500">Both start and end dates are required.</Text>}
          </Box>

          {/* License dropdown */}
          <Box>
            <label htmlFor="license">License</label>
            <Controller
              name="license"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select {...field} id="license" overflowY="auto">
                  <option value="" disabled>Select a license</option>
                  {licenses.map((license) => (
                    <option key={license.licenseId} value={license.licenseId}>
                      {license.licenseId} - {license.name}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </Select>
              )}
            />
            {errors.license && <Text color="red.500">{errors.license.message}</Text>}
          </Box>

          <Controller
            name="keywords"
            render={({ field }) => (
              <ArrayInput label="Keywords" error={errors.keywords} helper="Enter a comma-separated list of keywords." {...field} />
            )}
            control={control}
          />

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
                {fields.map((field, idx: number) => (
                  <Tr key={field.id || idx}>
                    <Td>
                      <Input {...register(`providers.${idx}.name`)} aria-labelledby="provider_name" />
                    </Td>
                    <Td>
                      <Input {...register(`providers.${idx}.description`)} aria-labelledby="provider_description" />
                    </Td>
                    <Td>
                      <Controller
                        name={`providers.${idx}.roles`}
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
                      <Input {...register(`providers.${idx}.url`)} aria-labelledby="provider_url" />
                    </Td>
                    <Td>
                      <IconButton
                        type="button"
                        size="sm"
                        icon={<MdDelete />}
                        onClick={() => remove(idx)}
                        aria-label="Remove provider"
                      />
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

          <Box mt="4">
            <Button type="submit" isLoading={updateState === "LOADING"}>
              {isEditMode ? "Save collection" : "Create collection"}
            </Button>
          </Box>
        </form>
      )}
    </>
  );
}

export default CollectionForm;

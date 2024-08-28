import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@chakra-ui/react";
import { MdDelete, MdAdd } from "react-icons/md";
import { FormValues } from "./types";
import { Loading, HeadingLead } from "../../components";
import useUpdateItem from "./useUpdateItem";
import Api from "../../api";
import { usePageTitle } from "../../hooks";
import {
  TextInput,
  TextAreaInput,
  NumberInput,
  ArrayInput,
  CheckboxField,
  DateTimeInput,
} from "../../components/forms";

// Assume that these default values are predefined for new items
const defaultValues = {
  id: "",
  type: "Feature",
  stac_version: "1.0.0",
  stac_extensions: ["https://example.com/extension"],
  collection: "",
  links: [
    {
      href: "string",
      rel: "string",
      type: "image/tiff; application=geotiff",
      title: "string",
      label: "assets",
      additionalProp1: {},
    },
  ],
  assets: {
    thumbnail: {
      href: "https://example.com/thumbnail.png",
      title: "Thumbnail",
      type: "image/png",
    },
  },
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
  bbox: [0, 0, 10, 10], // Example bbox initialization
  properties: {
    title: "testing",
    description: "string",
    datetime: "2024-08-26T22:12:31.927Z",
    created: "2024-08-26T22:12:31.927Z",
    updated: "2024-08-26T22:12:31.927Z",
    start_datetime: "2024-08-26T22:12:31.927Z",
    end_datetime: "2024-08-26T22:12:31.927Z",
    license: "string",
    providers: [
      {
        name: "string",
        description: "string",
        roles: ["producer"],
        url: "string",
      },
    ],
    platform: "string",
    constellation: "string",
    mission: "string",
    gsd: 1,
    instruments: ["string"],
  },
};

interface BBoxInputProps {
  register: any;
  errors: any;
}

interface AssetsInputProps {
  control: any;
  register: any;
  errors: any;
}

// Custom input for bbox (array of numbers)
const BBoxInput: React.FC<BBoxInputProps> = ({ register, errors }) => (
  <fieldset>
    <legend>Bounding Box</legend>
    <Box display="flex" gap="2">
      <Input
        placeholder="minX"
        type="number"
        {...register("bbox[0]", { valueAsNumber: true })}
      />
      <Input
        placeholder="minY"
        type="number"
        {...register("bbox[1]", { valueAsNumber: true })}
      />
      <Input
        placeholder="maxX"
        type="number"
        {...register("bbox[2]", { valueAsNumber: true })}
      />
      <Input
        placeholder="maxY"
        type="number"
        {...register("bbox[3]", { valueAsNumber: true })}
      />
    </Box>
    {errors?.bbox && <p>{errors.bbox.message}</p>}
  </fieldset>
);

// Custom input for assets (object with dynamic keys)
const AssetsInput: React.FC<AssetsInputProps> = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "assets",
  });

  return (
    <fieldset>
      <legend>Assets</legend>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Key</Th>
            <Th>Value</Th>
            <Th aria-label="Actions" />
          </Tr>
        </Thead>
        <Tbody>
          {fields.map((item, index) => (
            <Tr key={item.id}>
              <Td>
                <Input
                  placeholder="Asset Key"
                  {...register(`assets.${index}.key`)}
                />
              </Td>
              <Td>
                <Input
                  placeholder="Asset Value"
                  {...register(`assets.${index}.value`)}
                />
              </Td>
              <Td>
                <IconButton
                  size="sm"
                  icon={<MdDelete />}
                  onClick={() => remove(index)}
                  aria-label="Remove asset"
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
          onClick={() => append({ key: "", value: "" })}
        >
          Add Asset
        </Button>
      </Box>
      {errors?.assets && <p>{errors.assets.message}</p>}
    </fieldset>
  );
};

export default function ItemForm() {
  const { collectionId, itemId } = useParams();
  const navigate = useNavigate();
  const isNewItem = !itemId;

  usePageTitle(isNewItem ? "Add New Item" : `Edit item ${itemId}`);

  const itemResource = isNewItem
    ? null
    : `${process.env.REACT_APP_STAC_API}/collections/${collectionId}/items/${itemId}`;

  const { item, state, reload } = useItem(itemResource, { skip: isNewItem });
  const { update, state: updateState } = useUpdateItem(itemResource);
  const { collections } = useCollections();

  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    collectionId || ""
  );

  const [isJsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [message, setMessage] = useState<string | null>(null); // Add state for the message

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: isNewItem ? defaultValues : undefined,
    values: !isNewItem ? item : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties.providers",
  });

  const watchedValues = watch();

  useEffect(() => {
    if (!isJsonMode) {
      const updatedJson = JSON.stringify(watchedValues, null, 2);
      setJsonInput(updatedJson);
    }
  }, [watchedValues, isJsonMode]);

  const onSubmit = async (data: FormValues) => {
    // Ensure the datetime fields have timezone information
    if (data.properties.datetime && !data.properties.datetime.endsWith("Z")) {
      data.properties.datetime += "Z";
    }
    if (data.properties.start_datetime && !data.properties.start_datetime.endsWith("Z")) {
      data.properties.start_datetime += "Z";
    }
    if (data.properties.end_datetime && !data.properties.end_datetime.endsWith("Z")) {
      data.properties.end_datetime += "Z";
    }
    
    try {
      let message;
      if (isNewItem) {
        const postUrl = `${process.env.REACT_APP_STAC_API}/collections/${selectedCollectionId}/items`;
  
        await Api.fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        message = "Successfully created the new item.";
      } else {
        await update(data);
        message = "Successfully updated the item.";
        reload();
      }
      return message;
    } catch (error) {
      console.error("Error submitting data:", error);
      return "Failed to submit the item.";
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
      setJsonInput(JSON.stringify({ ...watchedValues }, null, 2));
    }
  };

  useEffect(() => {
    if (!item || isNewItem) return;

    const { start_datetime, end_datetime, datetime } = item.properties;
    if (start_datetime && end_datetime) {
      setDateType("range");
      setValue("properties.start_datetime", start_datetime.split("Z")[0]);
      setValue("properties.end_datetime", end_datetime.split("Z")[0]);
    } else {
      setDateType("single");
      setValue("properties.datetime", datetime.split("Z")[0]);
    }
  }, [item, setValue, isNewItem]);

  const [dateType, setDateType] = useState<string>();

  const handleRangeUpdate = (v?: string) => {
    if (v) {
      setValue("properties.datetime", null); 
      return `${v}T00:00:00Z`;
    }
    return undefined; 
  };

  const handleSingleDateUpdate = (v?: string) => {
    if (v) {
      setValue("properties.start_datetime", undefined);
      setValue("properties.end_datetime", undefined);
      return `${v}T00:00:00Z`; 
    }
    return null;
  };

  useEffect(() => {
    if (isNewItem) {
      setValue("collection", selectedCollectionId);
    }
  }, [selectedCollectionId, setValue, isNewItem]);

  if (state === "LOADING" && !isNewItem) {
    return <Loading>Loading item...</Loading>;
  }

  const handleFormSubmit = async (data: FormValues) => {
    const resultMessage = await onSubmit(data);
    setMessage(resultMessage); // Set the message
  };

  return (
    <>
      {message && (
        <Box mb="4" p="4" bg="green.100" borderRadius="md">
          <Text>{message}</Text>
        </Box>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text as="h1">
          <HeadingLead>
            {isNewItem ? "Add New Item" : `Edit Item ${item?.id}`}
          </HeadingLead>
        </Text>
        {isNewItem && (
          <Button type="button" onClick={toggleJsonMode}>
            {isJsonMode ? "Form" : "JSON"}
          </Button>
        )}
      </Box>
      {isNewItem && isJsonMode ? (
        <Box>
          <Textarea
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder="Enter item in JSON format"
            size="md"
            minHeight="80vh"
          />
          {jsonError && <Text color="red.500">{jsonError}</Text>}
          <Box mt="4">
            <Button
              onClick={handleSubmit(() => handleFormSubmit(JSON.parse(jsonInput)))}
              isLoading={updateState === "LOADING"}
            >
              Create Item
            </Button>
          </Box>
        </Box>
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Text as="h2">Common Meta Data</Text>
          <TextInput
            label="Title"
            error={errors.properties?.title}
            {...register("properties.title")}
          />
          <TextAreaInput
            label="Description"
            error={errors.properties?.description}
            {...register("properties.description")}
          />
          <TextInput
            label="License"
            error={errors.properties?.license}
            {...register("properties.license")}
          />

          <fieldset>
            <legend>Date</legend>
            <RadioGroup onChange={setDateType} value={dateType}>
              <Stack direction="row">
                <Radio value="single">Single date</Radio>
                <Radio value="range">Date range</Radio>
              </Stack>
            </RadioGroup>
            <Box
              aria-hidden={dateType !== "single"}
              display={dateType === "single" ? "block" : "none"}
            >
              <DateTimeInput
                label="Enter date"
                error={errors.properties?.datetime}
                {...register("properties.datetime")}
              />
            </Box>
            <Box
              aria-hidden={dateType === "single"}
              display={dateType !== "single" ? "flex" : "none"}
              gap="4"
            >
              <DateTimeInput
                label="Date/time from"
                error={errors.properties?.start_datetime}
                {...register("properties.start_datetime")}
              />
              <DateTimeInput
                label="Date/time to"
                error={errors.properties?.end_datetime}
                {...register("properties.end_datetime")}
              />
            </Box>
          </fieldset>

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
                      <Input
                        {...register(`properties.providers.${idx}.name`)}
                        aria-labelledby="provider_name"
                      />
                    </Td>
                    <Td>
                      <Input
                        {...register(`properties.providers.${idx}.description`)}
                        aria-labelledby="provider_description"
                      />
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
                      <Input
                        {...register(`properties.providers.${idx}.url`)}
                        aria-labelledby="provider_url"
                      />
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
              <Button
                type="button"
                variant="link"
                leftIcon={<MdAdd />}
                onClick={() => append({ name: "" })}
              >
                Add provider
              </Button>
            </Box>
          </fieldset>

          {isNewItem && (
            <>
              <Text as="h2">Item Meta Data</Text>
              <TextInput
                label="Item ID"
                error={errors.id}
                {...register("id", { required: "Item ID is required" })}
              />
              <Box mt={4}>
                <Text as="label" fontWeight="bold">
                  Select Collection
                </Text>
                <Select
                  placeholder="Select collection"
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  isRequired
                >
                  {collections?.collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.id}
                    </option>
                  ))}
                </Select>
              </Box>

              <TextInput
                label="STAC Version"
                error={errors.stac_version}
                {...register("stac_version")}
              />

              {/* Custom BBoxInput */}
              <BBoxInput register={register} errors={errors} />

              {/* Custom AssetsInput */}
              <AssetsInput control={control} register={register} errors={errors} />

              <fieldset>
                <legend>Geometry</legend>
                <TextAreaInput
                  label="Geometry (GeoJSON)"
                  error={errors.geometry}
                  {...register("geometry")}
                />
              </fieldset>
            </>
          )}

          <Text as="h2">Instruments</Text>
          <TextInput
            label="Platform"
            error={errors.properties?.platform}
            {...register("properties.platform")}
          />
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
          <TextInput
            label="Constellation"
            error={errors.properties?.constellation}
            {...register("properties.constellation")}
          />
          <TextInput
            label="Mission"
            error={errors.properties?.mission}
            {...register("properties.mission")}
          />
          <NumberInput
            label="Ground Sample Distance"
            error={errors.properties?.gsd}
            {...register("properties.gsd", { min: 1 })}
          />

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

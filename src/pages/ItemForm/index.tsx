import React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useItem, useCollections } from "@developmentseed/stac-react";
import {
  Box,
  Button,
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Input,
  IconButton,
  RadioGroup,
  Stack,
  Radio,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { MdDelete, MdAdd } from "react-icons/md";
import { FormValues } from "./types";
import { HeadingLead, Loading } from "../../components";
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

// Custom input for bbox (array of numbers)
const BBoxInput: React.FC<BBoxInputProps> = ({ register, errors }) => {
  return (
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
};

// Define prop types for AssetsInput
interface AssetsInputProps {
  control: any;
  register: any;
  errors: any;
}

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

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: isNewItem ? {
      id: "",
      type: "Feature",
      stac_version: "1.0.0",
      stac_extensions: [],
      collection: selectedCollectionId,
      links: [],
      assets: {}, // Initialize as an empty object
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
        title: "",
        description: "",
        datetime: new Date().toISOString(),
        created: new Date().toISOString(),
        updated: new Date().toISOString(), 
        start_datetime: new Date().toISOString(),
        end_datetime: new Date().toISOString(),
        license: "",
        providers: [{ name: "", description: "", roles: [], url: "" }],
        platform: "",
        constellation: "",
        mission: "",
        gsd: 1,
        instruments: [],
      },
    }
      : item,
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
    console.log("Submitting data:", data);
  
    if (isNewItem) {
      const postUrl = `http://localhost:8081/collections/${selectedCollectionId}/items`;
  
      const response = await Api.fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      update(data).then(reload);
    }
  };
  
  
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJson = e.target.value;
    setJsonInput(newJson);

    try {
      const parsedData = JSON.parse(newJson);
      Object.keys(parsedData).forEach((key) => {
        if (key === "bbox") {
          setValue(key, parsedData[key]); // Handle bbox as an array
        } else if (key === "assets") {
          setValue(key, parsedData[key]); // Handle assets as an object
        } else {
          setValue(key as keyof FormValues, parsedData[key]);
        }
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
      setValue("properties.datetime", null); // Ensure single datetime is cleared when range is used
      return `${v}T00:00:00Z`; // Ensure the time portion is included
    }
    return undefined; // Return undefined if no value is provided
  };

  const handleSingleDateUpdate = (v?: string) => {
    if (v) {
      setValue("properties.start_datetime", undefined);
      setValue("properties.end_datetime", undefined);
      return `${v}T00:00:00Z`; // Ensure the time portion is included
    }
    return null; // Clear the datetime value if input is empty
  };

  // Ensure collection selection is reflected in JSON output
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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text as="h1">
          <HeadingLead>
            {isNewItem ? "Add New Item" : `Edit Item ${item?.id}`}
          </HeadingLead>
        </Text>
        <Button type="button" onClick={toggleJsonMode}>
          {isJsonMode ? "Form" : "JSON"}
        </Button>
      </Box>
      {isJsonMode ? (
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
              onClick={handleSubmit(() => onSubmit(JSON.parse(jsonInput)))}
              isLoading={updateState === "LOADING"}
            >
              {isNewItem ? "Create Item" : "Save Item"}
            </Button>
          </Box>
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
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
              <BBoxInput
                register={register}
                errors={errors}
              />

              {/* Custom AssetsInput */}
              <AssetsInput
                control={control}
                register={register}
                errors={errors}
              />

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

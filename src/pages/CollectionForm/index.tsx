import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { Box, Button, IconButton, Input, Table, Tbody, Td, Text, Th, Thead, Tr, Textarea } from "@chakra-ui/react";
import { MdAdd, MdDelete } from "react-icons/md";
import { StacCollection } from "stac-ts";
import { useCollection } from "@developmentseed/stac-react";

import { FormValues } from "./types";
import useUpdateCollection from "./useUpdateCollection";
import { HeadingLead, Loading } from "../../components";
import { TextInput, TextAreaInput, ArrayInput, CheckboxField } from "../../components/forms";
import { usePageTitle } from "../../hooks";

function CollectionForm() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!collectionId;
  usePageTitle(isEditMode ? `Edit collection ${collectionId}` : "Add new collection");

  const { collection, state, reload } = useCollection(collectionId!);
  const { update, state: updateState } = useUpdateCollection();
  const [isJsonMode, setJsonMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  const { control, register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    defaultValues: isEditMode ? collection : {},
  });

  const { fields, append, remove } = useFieldArray({ control, name: "providers" });

  const defaultJsonStructure = {
    id: "",
    type: "Collection",
    title: "",
    links: [],
    description: "",
    extent: {
      spatial: {
        bbox: [[0, 0, 0, 0]]
      },
      temporal: {
        interval: [["2025-01-01T00:00:00Z", "2085-03-31T12:00:00Z"]]
      }
    },
    license: "",
    stac_extension: [],
    stac_version: "1.0.0",
  };

  const watchedValues = watch();

  useEffect(() => {
    if (!isEditMode) {
      const updatedJson = { ...defaultJsonStructure, ...watchedValues };
      setJsonInput(JSON.stringify(updatedJson, null, 2));
    }
  }, [watchedValues, isEditMode]);

  const onSubmit = (data: StacCollection) => {
    update(data, isEditMode).then(reload);
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  const handleJsonSubmit = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      Object.keys(parsedData).forEach(key => {
        setValue(key as keyof FormValues, parsedData[key]);
      });
      onSubmit(parsedData);
    } catch (error) {
      console.error("Invalid JSON input");
    }
  };

  const toggleJsonMode = () => {
    setJsonMode(!isJsonMode);
  };

  if (!collection && isEditMode && state === "LOADING") {
    return <Loading>Loading collection...</Loading>;
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Text as="h1">
          <HeadingLead>{isEditMode ? "Edit Collection" : "Add New Collection"}</HeadingLead> {isEditMode && collection.id}
        </Text>
        {!isEditMode && (
          <Button type="button" onClick={toggleJsonMode}>
            {isJsonMode ? "Form" : "JSON"}
          </Button>
        )}
      </Box>
      {isJsonMode && !isEditMode ? (
        <Box>
          <Textarea
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder="Enter collection in JSON format"
            size="md"
            minHeight="80vh"
          />
          <Box mt="4">
            <Button onClick={handleJsonSubmit} isLoading={updateState === "LOADING"}>
              Create collection
            </Button>
          </Box>
        </Box>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          {!isEditMode && (
            <TextInput
              label="ID"
              error={errors.id}
              {...register("id", { required: "Enter a collection ID." })}
            />
          )}
          <TextInput
            label="Title"
            error={errors.title}
            {...register("title")}
          />
          <TextAreaInput
            label="Description"
            error={errors.description}
            {...register("description", { required: "Enter a collection description." })}
          />
          <TextInput
            label="License"
            error={errors.license}
            {...register("license")}
          />

          <Controller
            name="keywords"
            render={({ field }) => (
              <ArrayInput
                label="Keywords"
                error={errors.keywords}
                helper="Enter a comma-separated list of keywords."
                {...field}
              />
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
                {fields.map(({ id }, idx: number) => (
                  <Tr key={id}>
                    <Td>
                      <Input
                        {...register(`providers.${idx}.name`)}
                        aria-labelledby="provider_name"
                      />
                    </Td>
                    <Td>
                      <Input
                        {...register(`providers.${idx}.description`)}
                        aria-labelledby="provider_description"
                      />
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
                              { value: "host", label: "Host" }
                            ]}
                            {...field}
                          />
                        )}
                        control={control}
                      />
                    </Td>
                    <Td>
                      <Input
                        {...register(`providers.${idx}.url`)}
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

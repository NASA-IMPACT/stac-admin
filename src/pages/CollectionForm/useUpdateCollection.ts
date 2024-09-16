import { useCallback, useState } from "react";
import { StacCollection } from "stac-ts";
import Api from "../../api";
import { LoadingState, ApiError } from "../../types";
import { defaultData } from "./constants/updateDataDefaultValue";

type UseUpdateCollectionType = {
  update: (data: StacCollection, isEditMode: boolean) => Promise<StacCollection>;
  error?: ApiError;
  state: LoadingState;
}

function useUpdateCollection(): UseUpdateCollectionType {
  const [error, setError] = useState<ApiError>();
  const [state, setState] = useState<LoadingState>("IDLE");

  const update = useCallback(async (data: StacCollection, isEditMode: boolean) => {
    setState("LOADING");

    const requestData = {
      ...defaultData,
      ...data,
      extent: {
        ...defaultData.extent,
        ...data.extent,
        spatial: {
          bbox: data.extent?.spatial?.bbox || defaultData.extent.spatial.bbox,
        },
        temporal: {
          interval: data.extent?.temporal?.interval || defaultData.extent.temporal.interval,
        },
      },
    };

    const url = isEditMode
      ? `${process.env.REACT_APP_STAC_API}/collections/${data.id}`
      : `${process.env.REACT_APP_STAC_API}/collections`;

    const method = isEditMode ? "PUT" : "POST";

    try {
      const updatedCollection: StacCollection = await Api.fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      setState("IDLE");
      return updatedCollection;
    } catch (e) {  // Use `unknown` instead of `any`
      if (e instanceof Error && "status" in e && "statusText" in e) {
        setError(e as ApiError);  // Type assertion to `ApiError`
      } else {
        setError({
          status: 500,
          statusText: "Unknown Error",
          detail: e instanceof Error ? e.message : "An unknown error occurred",
        });
      }
      setState("IDLE");
      throw e;
    }
  }, []);

  return {
    update,
    error,
    state,
  };
}

export default useUpdateCollection;

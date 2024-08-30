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
      const result = await Api.fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      setState("IDLE");
      return `Successfully ${isEditMode ? "updated" : "created"} the collection.`;
    } catch (e: any) {
      setError(e);
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

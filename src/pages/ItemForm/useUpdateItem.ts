import { useCallback, useState } from "react";
import { StacItem } from "stac-ts";
import Api from "../../api";
import { LoadingState, ApiError } from "../../types";
import { useAuth } from "react-oidc-context";


type UseUpdateItemType = {
  update: (data: StacItem) => Promise<StacItem>;
  error?: ApiError;
  state: LoadingState;
};

function useUpdateItem(url: string): UseUpdateItemType {
  const [error, setError] = useState<ApiError>();
  const [state, setState] = useState<LoadingState>("IDLE");

  const auth = useAuth();

  const update = useCallback(
    (data: StacItem) => {
      setState("LOADING");

      return Api.fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.user?.access_token}`
        },
        body: JSON.stringify(data),
      })
        .catch((e) => setError(e))
        .finally(() => setState("IDLE"));
    },
    [setError, url]
  );

  return {
    update,
    error,
    state,
  };
}

export default useUpdateItem;

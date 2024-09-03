import { StacAsset, StacExtensions, StacLink, StacProvider, StacVersion } from "stac-ts";

export type FormValues = {
  id: string;
  type: "Feature";
  stac_version: StacVersion;
  stac_extensions?: StacExtensions;
  collection?: string;
  links: Array<{
    href?: string;
    rel?: string;
    type?: string;
    title?: string;
    [key: string]: any;
  }>;
  assets: { [k: string]: { [key: string]: any } };
  geometry:
    | {
        type: string;
        coordinates: any;
        bbox?: number[];
        [key: string]: any;
      }
    | null;
  bbox?: number[];
  properties: {
    title: string;
    description: string;
    license: string;
    // providers: StacProvider[];
    providers: Array<{
      name?: string;
      description?: string;
      roles?: string[];
      url?: string;
      [key: string]: any;
    }>;
    platform: string;
    constellation: string;
    mission: string;
    gsd: number;
    instruments: string[];
    datetime: string | null;
    start_datetime?: string;
    end_datetime?: string;
    created?: string;
    updated?: string;
  }
}

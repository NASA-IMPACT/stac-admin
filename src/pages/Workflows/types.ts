export type SpatialExtent = {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
};

export type TemporalExtent = {
  startdate: string;
  enddate: string;
};

export type Asset = {
  title: string;
  description: string;
  regex: string;
};

export type DiscoveryItem = {
  discovery: string;
  collection: string;
  bucket: string;
  prefix: string;
  filename_regex: string;
  datetime_range: string;
  assets: Record<string, Asset>;
  id_regex: string;
  id_template: string;
};

export type Provider = {
  name: string;
  roles: string[];
  url: string;
};

export type Thumbnail = {
  description: string;
  href: string;
  roles: string[];
  title: string;
  type: string;
};

export type ItemAsset = {
  type: string;
  roles: string[];
  title: string;
  description: string;
};

export type RenderDashboard = {
  assets: string[];
  colormap_name: string;
  rescale: [number, number][];
};

export type WorkflowFormValues = {
  collection: string;
  data_type: string;
  spatial_extent: SpatialExtent;
  temporal_extent: TemporalExtent;
  stac_version: string;
  stac_extensions: string[];
  title: string;
  description: string;
  discovery_items: DiscoveryItem[];
  is_periodic: boolean;
  license: string;
  sample_files: string[];
  providers: Provider[];
  renders: {
    dashboard: RenderDashboard;
  };
  assets: {
    thumbnail: Thumbnail;
  };
  item_assets: Record<string, ItemAsset>;
  time_density: string;
};

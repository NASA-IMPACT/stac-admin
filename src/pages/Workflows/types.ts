export type WorkflowFormValues = {
  id: string;
  bucket: string;
  prefix: string;
  filename_regex: string;
  id_regex: string;
  id_template: string;
  datetime_range: string;
  assets: {
    title: string;
    description: string;
    regex: string;
  }[];
  discovery: string;
  upload: string;
};

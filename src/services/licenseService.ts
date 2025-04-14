import { LICENSES_URL } from "../constants/constant";

export interface License {
  licenseId: string;
  name: string;
}

export const fetchLicenses = async (): Promise<License[]> => {
  const response = await fetch(LICENSES_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch licenses: ${response.statusText}`);
  }
  const data = await response.json();
  return data.licenses;
};

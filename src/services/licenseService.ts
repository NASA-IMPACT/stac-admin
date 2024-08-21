export interface License {
  licenseId: string;
  name: string;
}

export const fetchLicenses = async (): Promise<License[]> => {
  try {
    const response = await fetch("https://raw.githubusercontent.com/spdx/license-list-data/main/json/licenses.json");
    const data = await response.json();
    return data.licenses;
  } catch (error) {
    console.error("Error fetching licenses:", error);
    return [];
  }
};
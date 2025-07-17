
"use server";

import type { ProviderService } from "@/types";

type SearchParams = {
  npi?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
};

export async function searchMedicareProviders(
  params: SearchParams
): Promise<{ data?: ProviderService[]; error?: string }> {
  const baseUrl = "https://data.cms.gov/data-api/v1/dataset/92396110-2aed-4d63-a6a2-5d6207d46a29/data";
  const queryParams = new URLSearchParams();

  if (params.npi) {
    queryParams.append('Rndrng_NPI', params.npi);
  } else {
    if (params.lastName) queryParams.append('Rndrng_Prvdr_Last_Org_Name', params.lastName.toUpperCase());
    if (params.firstName) queryParams.append('Rndrng_Prvdr_First_Name', params.firstName.toUpperCase());
    if (params.city) queryParams.append('Rndrng_Prvdr_City', params.city.toUpperCase());
    if (params.state) queryParams.append('Rndrng_Prvdr_State_Abrvtn', params.state.toUpperCase());
  }

  // Add a limit to prevent fetching excessive data
  queryParams.append('size', '100');

  const fullUrl = `${baseUrl}?${queryParams.toString()}`;

  try {
    const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        // Using a short revalidation time as the data is updated annually
        next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`CMS API Error: ${response.status} ${response.statusText}`, errorBody);
      return { error: `Failed to fetch data from CMS. Status: ${response.status}. Please check your search terms.` };
    }

    const data: ProviderService[] = await response.json();
    return { data };
  } catch (error) {
    console.error("Error fetching from CMS API:", error);
    if (error instanceof Error) {
        return { error: `An unexpected error occurred: ${error.message}` };
    }
    return { error: "An unexpected error occurred while fetching provider data." };
  }
}

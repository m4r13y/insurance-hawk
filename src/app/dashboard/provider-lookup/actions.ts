
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
    // NPI search uses a simple filter
    queryParams.append('filter[npi][condition][path]', 'Rndrng_NPI');
    queryParams.append('filter[npi][condition][operator]', '=');
    queryParams.append('filter[npi][condition][value]', params.npi);
  } else {
    // Name and location search uses the complex filtering
    if (params.lastName) {
      queryParams.append('filter[lastName][condition][path]', 'Rndrng_Prvdr_Last_Org_Name');
      // Use CONTAINS for broader matching
      queryParams.append('filter[lastName][condition][operator]', 'CONTAINS');
      queryParams.append('filter[lastName][condition][value]', params.lastName.toUpperCase());
    }
    if (params.firstName) {
      queryParams.append('filter[firstName][condition][path]', 'Rndrng_Prvdr_First_Name');
      queryParams.append('filter[firstName][condition][operator]', 'CONTAINS');
      queryParams.append('filter[firstName][condition][value]', params.firstName.toUpperCase());
    }
    if (params.city) {
      queryParams.append('filter[city][condition][path]', 'Rndrng_Prvdr_City');
      queryParams.append('filter[city][condition][operator]', '=');
      queryParams.append('filter[city][condition][value]', params.city.toUpperCase());
    }
    if (params.state) {
      queryParams.append('filter[state][condition][path]', 'Rndrng_Prvdr_State_Abrvtn');
      queryParams.append('filter[state][condition][operator]', '=');
      queryParams.append('filter[state][condition][value]', params.state.toUpperCase());
    }
  }

  // Add a limit to prevent fetching excessive data and sort the results for consistency
  queryParams.append('size', '100');
  queryParams.append('sort', 'Rndrng_Prvdr_Last_Org_Name,Rndrng_Prvdr_First_Name');

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
      console.error(`CMS API Error: ${response.status} ${response.statusText}`, { url: fullUrl, body: errorBody });
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

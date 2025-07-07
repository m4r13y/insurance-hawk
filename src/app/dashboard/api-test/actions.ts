
'use server';

export async function testGetCounty(zipCode: string) {
    const apiKey = process.env.HEALTHCARE_GOV_API_KEY;
    if (!apiKey) {
        console.error("Healthcare.gov API key is not configured.");
        return { error: 'The quoting service is currently unavailable. API Key not set.' };
    }

    const apiGetHeaders = {
        'accept': 'application/json',
    };
    
    const url = `https://marketplace.api.healthcare.gov/api/v1/counties/by/zip/${zipCode}?apikey=${apiKey}`;

    console.log(`Fetching county data from: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: apiGetHeaders,
            cache: 'no-store', // Ensure no caching
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
            return { error: `API request failed with status ${response.status}: ${response.statusText}. Details: ${errorText}` };
        }

        const data = await response.json();
        console.log("API Response OK:", data);
        return { data };

    } catch (e: any) {
        console.error("An unexpected error occurred in testGetCounty:", e);
        return { error: `An unexpected network error occurred: ${e.message}` };
    }
}

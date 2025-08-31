# Firebase Function Update: getMedicareAdvantageQuotes

Based on my analysis of the hawknest repository, the `getMedicareAdvantageQuotes` function needs to be implemented in `functions/src/index.ts`. Here's the implementation that should be added:

## Function Implementation

Add this function to `functions/src/index.ts` after the existing quote functions:

```typescript
// Medicare Advantage quotes function
export const getMedicareAdvantageQuotes = v2.https.onCall(
  async (request: v2.https.CallableRequest<{
    zip5: string;
    age: number;
    gender: string;
    tobacco: number;
    effective_date?: string;
    county?: string;
    offset?: number;
    limit?: number;
  }>) => {
    // Defensive: Ensure this is a valid callable request
    if (!request || typeof request !== "object" || !request.data) {
      v2.logger.error(
        "Invalid callable request: missing data property",
        {request}
      );
      throw new v2.https.HttpsError(
        "invalid-argument",
        "Request must be made using Firebase Callable Functions and " +
        "include a data property."
      );
    }
    v2.logger.info("getMedicareAdvantageQuotes called", {data: request.data});
    try {
      // Extract parameters
      const {zip5, age, gender, tobacco, effective_date, county, offset, limit} = request.data;
      const apiUrl = "https://csgapi.appspot.com/v1/medicare_advantage/quotes.json";
      const token = await getCurrentToken();
      
      // Build parameters object
      const params: Record<string, any> = {zip5, age, gender, tobacco};
      if (effective_date !== undefined) params.effective_date = effective_date;
      if (county !== undefined) params.county = county;
      if (offset !== undefined) params.offset = offset;
      if (limit !== undefined) params.limit = limit;
      
      v2.logger.info(
        "Calling CSG Medicare Advantage API", {apiUrl, token, params}
      );
      const response = await axios.get(apiUrl, {
        params,
        headers: {
          "x-api-token": token,
        },
      });
      v2.logger.info(
        "CSG Medicare Advantage API response",
        {response: response.data}
      );
      return response.data;
    } catch (error) {
      v2.logger.error("Error in getMedicareAdvantageQuotes", {error});
      throw new v2.https.HttpsError(
        "internal",
        "Error fetching Medicare Advantage quotes",
        {
          message: error instanceof Error ? error.message : "Unknown error",
        }
      );
    }
  }
);
```

## Key Points:

1. **API Endpoint**: Assumes CSG API has a Medicare Advantage endpoint at `/medicare_advantage/quotes.json`
2. **effective_date Parameter**: Properly handles the effective_date parameter for 2025 plan year filtering
3. **Pattern Consistency**: Follows the exact same pattern as existing functions (getMedigapQuotes, getDentalQuotes, getHospitalIndemnityQuotes)
4. **Error Handling**: Includes comprehensive error handling and logging
5. **Parameter Validation**: Uses the same defensive programming approach as other functions

## Installation Steps:

1. Add this function to your `functions/src/index.ts` file
2. Deploy the Firebase functions: `firebase deploy --only functions`
3. The existing `advantage-quotes.ts` action should then work correctly with the effective_date parameter

This implementation will resolve the Firebase function error you're encountering and enable 2025 plan year filtering for Medicare Advantage quotes.

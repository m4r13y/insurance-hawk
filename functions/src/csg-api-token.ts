import axios from 'axios';

// Replace with your actual API key for testing
const CSG_API_KEY = '406dc38f9616ca4da2665b4a9e3565620fd37a862582f40b0c017b5e38ebefd5';

async function getCSGToken() {
  try {
    const response = await axios.post('https://csgapi.appspot.com/v1/auth.json', {
      api_key: CSG_API_KEY,
      portal_name: 'csg_individual'
    });

    const token = response.data.token;
    console.log('Token:', token);
    return token;
  } catch (error) {
    // If using axios < v1, error may be 'any'
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message);
    } else {
      console.error('Unknown Error:', error);
    }
    return null;
  }
}

getCSGToken();

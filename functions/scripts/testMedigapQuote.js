const axios = require("axios");

async function getMedigapQuote() {
  const url = "http://localhost:5001/medicareally/us-central1/getMedigapQuotes";
  const data = {
    zip5: "12345",
    age: 65,
    gender: "M",
    tobacco: 0,
    plan: "A"
  };

  try {
    console.log("Sending request to:", url);
    const response = await axios.post(url, { data });
    console.log("Medigap Quote Response:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    console.error("Full error:", error);
  }
}

getMedigapQuote();

const axios = require("axios");

/**
 * Get Judge0 language ID from a human-readable name.
 */
const getLanguageById = (lang) => {
  const language = {
    "c++": 54,
    java: 62,
    javascript: 63,
  };

  const id = language[lang.toLowerCase()];
  if (!id) {
    throw new Error(`Unsupported language: ${lang}`);
  }
  return id;
};

/**
 * Submit a batch of code submissions to Judge0.
 */
const submitBatch = async (submissions) => {
  if (!process.env.RAPIDAPI_KEY) {
    const msg ="RAPIDAPI_KEY is not set. Please add RAPIDAPI_KEY to your .env or environment variables.";
    console.error("SubmitBatch Error:", msg);
    throw new Error(msg);
  }

  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: { base64_encoded: "false" },
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: { submissions },
  };


  async function fetchData(){
  try {
    const response = await axios.request(options);
    return response.data;
  } 
  catch (error) {
    console.log(error);
  }
}
return await fetchData();
};

/**
 * Simple async wait helper (used between Judge0 polling requests).
 */
const waiting = async (timer) => {
  return new Promise(resolve => setTimeout(resolve, timer));
};

/**
 * Poll Judge0 until all tokens finish executing, or timeout occurs.
 */
const submitToken = async (resultTokens) => {
  if (!Array.isArray(resultTokens) || resultTokens.length === 0) {
    throw new Error("submitToken expects a non-empty array of tokens");
  }

  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: resultTokens.join(","),
      base64_encoded: "false",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  async function fetchData(){
  try {
    const response = await axios.request(options);
    return response.data;
  } 
  catch (error) {
    console.log(error);
  }
}

while(true)
{
const result = await fetchData();

const IsResultObtained = result.submissions.every((r)=>r.status_id>2);

if(IsResultObtained)
{
  return result.submissions;
}
await waiting(1000);
}
}

module.exports = {
  getLanguageById,
  submitBatch,
  submitToken,
};


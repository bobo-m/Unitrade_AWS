// fetcher.js
export const fetcher = {
  async post(url, data) {
    console.log('Sending data:', data); // Log the data being sent
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error response:', error); // Log the error response
      throw new Error(error || 'An error occurred while fetching data.');
    }

    const jsonResponse = await response.json(); // Parse the JSON response
    console.log('Received response:', jsonResponse); // Log the response data
    return jsonResponse;
  },
};

export const fetcherGet = async (url, method = 'GET', body = null) => {
  try {
    // Get token from localStorage
    const tokenData = localStorage.getItem('user');
    if (!tokenData) {
      throw new Error('No token data found in localStorage');
    }

    const parsedTokenData = JSON.parse(tokenData);
    const token = parsedTokenData.token;

    if (!token) {
      throw new Error('Token not found');
    }

    // Define fetch options
    const options = {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    // If body is provided, add it to the request
    if (body) {
      options.body = JSON.stringify(body);
    }

    // Make the API call using fetch
    const response = await fetch(url, options);

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    // Parse and return the response JSON
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error in fetcher: ${error.message}`);
  }
};

export const fetcherPost = async (url, body = {}) => {
  try {
    // Retrieve token from localStorage
    const tokenData = localStorage.getItem('user');
    if (!tokenData) {
      throw new Error('No token data found in localStorage');
    }

    const parsedTokenData = JSON.parse(tokenData);
    const token = parsedTokenData.token;

    if (!token) {
      throw new Error('Token not found');
    }

    // Set up request options
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body), // Add the request body for POST
    };

    // Execute the fetch call
    const response = await fetch(url, options);
   // Parse response as JSON
   const responseData = await response.json();
    // Check for non-2xx responses
    if (!response.ok) {
   // Use backend-provided error message if available
   const backendError = responseData?.error || response.statusText || 'An unknown error occurred.';
   throw new Error(backendError);
    }

    return responseData; // Return successful response data

  } catch (error) {
    throw new Error(`${error.message}`);
  }
};

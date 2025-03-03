import { BACKEND_URL } from '../../src/config';

export const API_URLS = {
  pendingCoins: `${BACKEND_URL}/api/v1/pending-coins`,
  apiQuests: `${BACKEND_URL}/api/v1/api-quests`,
  apiCompanies: `${BACKEND_URL}/api/v1/api-companies`,
  apiSettings: `${BACKEND_URL}/api/v1/api-settings`,
  // Add more API URLs as needed
};

export const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    return null; // Return null or handle the error as needed
  }
};

// Uncomment and use this function if you need to fetch data with a token
// export const fetchDataToken = async (url) => {
//   try {
//     const token = getToken('user'); // Fetch token after checking expiration

//     if (!token) {
//       throw new Error('No valid token found! Please login.');
//     }

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
//         'Content-Type': 'application/json'
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('API fetch error:', error.message);
//     return null; // Return null or handle the error as needed
//   }
// };

import { BACKEND_URL } from '../../src/config';

// Action Types
export const USER_UPDATE_REQUEST = 'USER_UPDATE_REQUEST';
export const USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS';
export const USER_UPDATE_FAILURE = 'USER_UPDATE_FAILURE';

// Action to update user profile
export const updateUserProfile = (updatedFormData) => {
    console.log('updatedFormData', updatedFormData);
    return async (dispatch) => {
      dispatch({ type: USER_UPDATE_REQUEST });
  
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
  
        // Send request to backend to update user profile
        const response = await fetch(`${BACKEND_URL}/api/v1/api-me/update`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,  // Pass token in the header
          },
          body: updatedFormData,  // Directly pass FormData
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update profile');
        }
  
        const data = await response.json();
        dispatch({
          type: USER_UPDATE_SUCCESS,
          payload: data, // Payload from API response
        });
      } catch (error) {
        dispatch({
          type: USER_UPDATE_FAILURE,
          payload: error.message,
        });
      }
    };
  };

  

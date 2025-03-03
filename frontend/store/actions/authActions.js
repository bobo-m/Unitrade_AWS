import { fetcher } from '../fetcher';
import { BACKEND_URL } from '../../src/config';
import Cookies from 'js-cookie';

// Action types
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS';
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE';
export const LOGOUT = 'LOGOUT';
export const LOAD_USER = 'LOAD_USER';

export const PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST';
export const PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS';
export const PASSWORD_RESET_FAILURE = 'PASSWORD_RESET_FAILURE';


export const PASSWORD_UPDATE_REQUEST = 'PASSWORD_UPDATE_REQUEST';
export const PASSWORD_UPDATE_SUCCESS = 'PASSWORD_UPDATE_SUCCESS';
export const PASSWORD_UPDATE_FAIL = 'PASSWORD_UPDATE_FAIL';
// Set token in cookies (expires in 7 days)
// const setToken = (token) => {
//   Cookies.set('token', JSON.stringify(token), { expires: 7 });
// };


// Get token from cookies
// const getToken = () => {
//   return Cookies.get('token');
// };


// Remove token from cookies
// const removeToken = () => {
//   Cookies.remove('token');
// };



// Centralized function to store user data in localStorage
export const storeUserData = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Centralized function to retrieve user data from localStorage
const getUserDataFromLocalStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Login action
export const login = (credentials) => async (dispatch) => {
  try {
    // Make the API request to the backend
    const response = await fetcher.post(`${BACKEND_URL}/api/v1/api-login`, credentials);

    // Check if the response contains a token and login is successful
    if (response?.token && response?.success) {
      // setToken(response.token); // Store the token in cookies or localStorage
      const userData = { token: response.token, ...response };
      storeUserData(userData); // Save user data in localStorage

      // Dispatch login success action
      dispatch({
        type: LOGIN_SUCCESS,
        payload: userData,
      });

      // Return the successful response with user data
      return { success: true, user: response.user, token: response.token };
    }

    // Check for the account not being active yet
    if (response?.message && response.message === "Your account is not active yet. Please wait for activation.") {
      return { 
        status: 0, 
        message: response.message, 
        user: response.user,
        pay_confirm: response.pay_confirm // Include the pay_confirm status
      };
    }

    // Check for the account needing confirmation or payment
    if (response?.message && response.message === "Your account is not yet confirmed or active. Please complete the necessary steps.") {
      return { 
        status: "payment_required", 
        message: response.message, 
        user: response.user, 
        pay_confirm: response.pay_confirm // Include the pay_confirm status
      };
    }

    // Default error handling if no token or other error occurred
    throw new Error(response?.error || "Token not received from the server.");

  } catch (error) {
    // Handle other errors (e.g., network issues)
    const errorMessage = error?.message || "An unknown error occurred."; // Default error message

    // Log the error for debugging
    console.error("Login failed:", errorMessage);

    // Dispatch login failure action with error message
    dispatch({
      type: LOGIN_FAILURE,
      payload: errorMessage,
    });

    // Return the error to be handled in the component
    return { success: false, message: errorMessage };
  }
};





// Signup action
export const signUp = (credentials) => async (dispatch) => {
  try {
    const response = await fetcher.post(`${BACKEND_URL}/api/v1/api-register`, credentials);

    console.log('API response:', response); // Log API response

    if (response?.token) {
      setToken(response.token); // Store the token in cookies
      const userData = { token: response.token, ...response };
      storeUserData(userData); // Save user data in localStorage

      dispatch({
        type: SIGNUP_SUCCESS,
        payload: userData,
      });
    } else {
      throw new Error('Token not received from the server.');
    }
  } catch (error) {
    console.error('Signup failed:', error.message); // Log error
    dispatch({
      type: SIGNUP_FAILURE,
      payload: error.message,
    });
    throw error; // Rethrow error for component handling
  }
};




export const resetPassword = (email) => async (dispatch) => {
  dispatch({ type: PASSWORD_RESET_REQUEST });

  try {
      const response = await fetch(`${BACKEND_URL}/api/v1/api-password/forgot`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
          dispatch({
              type: PASSWORD_RESET_SUCCESS,
              payload: data.message || 'Reset link sent successfully.',
          });
          return Promise.resolve(data.message || 'Reset link sent successfully.'); // Resolve on success
      } else {
          dispatch({
              type: PASSWORD_RESET_FAILURE,
              payload: data.message || 'Error sending reset link. Please try again.',
          });
          return Promise.reject(data.error || 'Error sending reset link. Please try again.'); // Reject on failure
      }
  } catch (error) {
      dispatch({
          type: PASSWORD_RESET_FAILURE,
          payload: error.message || 'Error sending reset link. Please try again.',
      });
      return Promise.reject(error.message || 'Error sending reset link. Please try again.'); // Reject on catch
  }
};


export const updatePassword = (formPassword) => async (dispatch) => {
  dispatch({ type: 'PASSWORD_UPDATE_REQUEST' });

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

    const response = await fetch(`${BACKEND_URL}/api/v1/api-password/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Include token in the Authorization header
      },
      body: JSON.stringify(formPassword), // Pass passwordData directly here
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update password');
    }

    const data = await response.json();
    dispatch({
      type: 'PASSWORD_UPDATE_SUCCESS',
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: 'PASSWORD_UPDATE_FAIL',
      payload: error.message || 'An error occurred',
    });
    throw error; // Re-throw error for component-level handling
  }
};
// Logout action
export const logout = () => (dispatch) => {
  localStorage.removeItem('user'); // Remove user data from localStorage
  dispatch({
    type: LOGOUT,
  });
};



// Load user from localStorage into the app state
export const loadUserFromLocalStorage = () => (dispatch) => {
  const user = getUserDataFromLocalStorage();

  if (user) {
    dispatch({
      type: LOAD_USER,
      payload: user,
    });
  } else {
    console.log('No user found in localStorage.');
  }
};

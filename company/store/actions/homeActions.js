import { fetchData, API_URLS } from '../utils/home';
import { fetcherGet , fetcherPost } from '../fetcher';  
import { BACKEND_URL } from '../../src/config';
import { toast } from "react-toastify";

// Action to set the data
export const setAPIData = (apiName, data) => ({
  type: `SET_${apiName.toUpperCase()}_DATA`,
  payload: data,
});

// Action to set loading state
export const setAPILoading = (apiName) => ({
  type: `FETCH_${apiName.toUpperCase()}_REQUEST`,
});

// Action to set error state
export const setAPIError = (apiName, error) => ({
  type: `FETCH_${apiName.toUpperCase()}_FAILURE`,
  error,
});

// Async action to fetch data
export const fetchAPIData = (apiName) => async (dispatch) => {
  dispatch(setAPILoading(apiName));

  try {
    const url = API_URLS[apiName];
    const data = await fetchData(url);
    dispatch(setAPIData(apiName, data));
  } catch (error) {
    dispatch(setAPIError(apiName, error.message || 'Something went wrong'));
  }
};


export const FETCH_ME_REQUEST = 'FETCH_ME_REQUEST';
export const SET_ME_DATA  = 'SET_ME_DATA';
export const FETCH_ME_FAILURE = 'FETCH_ME_FAILURE';

export const FETCH_USER_REQUEST = 'FETCH_USER_REQUEST';
export const SET_USER_DATA  = 'SET_USER_DATA';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';

export const FETCH_GETALL_PENDING_REQUEST = 'FETCH_GETALL_PENDING_REQUEST';
export const SET_GETALL_PENDING_DATA  = 'SET_GETALL_PENDING_DATA';
export const FETCH_GETALL_PENDING_FAILURE = 'FETCH_GETALL_PENDING_FAILURE';

export const FETCH_HISTORY_REQUEST = 'FETCH_HISTORY_REQUEST';
export const SET_HISTORY_DATA  = 'SET_HISTORY_DATA';
export const FETCH_HISTORY_FAILURE = 'FETCH_HISTORY_FAILURE';

export const FETCH_QUEST_HISTORY_REQUEST = 'FETCH_QUEST_HISTORY_REQUEST';
export const SET_QUEST_HISTORY_DATA  = 'SET_QUEST_HISTORY_DATA';
export const FETCH_QUEST_HISTORY_FAILURE = 'FETCH_QUEST_HISTORY_FAILURE';

export const FETCH_WITHDRAWAL_REQUEST = 'FETCH_WITHDRAWAL_REQUEST';
export const SET_WITHDRAWAL_DATA  = 'SET_WITHDRAWAL_DATA';
export const FETCH_WITHDRAWAL_FAILURE = 'FETCH_WITHDRAWAL_FAILURE';

export const UPDATE_COIN_RATE_REQUEST = 'UPDATE_COIN_RATE_REQUEST';
export const UPDATE_COIN_RATE_SUCCESS = 'UPDATE_COIN_RATE_SUCCESS';
export const UPDATE_COIN_RATE_FAILURE = 'UPDATE_COIN_RATE_FAILURE';

export const USER_APPROVE_REQUEST = "USER_APPROVE_REQUEST";
export const USER_APPROVE_SUCCESS = "USER_APPROVE_SUCCESS";
export const USER_APPROVE_FAILURE = "USER_APPROVE_FAILURE";



// Fetch User Request Action
const fetchMeRequest = () => {
  return {
    type: FETCH_ME_REQUEST,
  };
};

// Fetch User Success Action
const setMeData  = (data) => {
  return {
    type: SET_ME_DATA,
    payload: data,
  };
};

// Fetch User Failure Action
const fetchMeFailure = (error) => {
  return {
    type: FETCH_ME_FAILURE,
    payload: error,
  };
};
// Fetch User Request Action
const fetchUserRequest = () => {
  return {
    type: FETCH_USER_REQUEST,
  };
};

// Fetch User Success Action
const setUserData  = (data) => {
  return {
    type: SET_USER_DATA,
    payload: data,
  };
};

// Fetch User Failure Action
const fetchUserFailure = (error) => {
  return {
    type: FETCH_USER_FAILURE,
    payload: error,
  };
};

export const fetchCompanyData = () => async (dispatch) => {
  dispatch(fetchMeRequest());
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/api-company-detail`);
    dispatch(setMeData(data));
  } catch (error) {
    dispatch(fetchMeFailure(error.message));
  }
};
export const fetchUserData = () => async (dispatch) => {
  dispatch(fetchUserRequest());
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/api-getall-req`);
    dispatch(setUserData(data));
  } catch (error) {
    dispatch(fetchUserFailure(error.message));
  }
};

export const fetchAllPendingData = () => async (dispatch) => {
  dispatch({type: FETCH_GETALL_PENDING_REQUEST});
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/api-getall-pending`);
    dispatch({ type: SET_GETALL_PENDING_DATA, payload: data });
  } catch (error) {
    dispatch({
      type: FETCH_GETALL_PENDING_FAILURE,
      payload: error.message,
    });
  }
};
export const fetchHistory = () => async (dispatch) => {
  dispatch({type: FETCH_HISTORY_REQUEST});
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/api-getall-history`);
    dispatch({ type: SET_HISTORY_DATA, payload: data });
  } catch (error) {
    dispatch({
      type: FETCH_HISTORY_FAILURE,
      payload: error.message,
    });
  }
};

export const fetchQuestHistory = () => async (dispatch) => {
  dispatch({type: FETCH_QUEST_HISTORY_REQUEST});
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/quest-history`);
    dispatch({ type: SET_QUEST_HISTORY_DATA, payload: data });
  } catch (error) {
    dispatch({
      type: FETCH_QUEST_HISTORY_FAILURE,
      payload: error.message,
    });
  }
};

export const fetchWithdrawal = () => async (dispatch) => {
  dispatch({type: FETCH_WITHDRAWAL_REQUEST});
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/user-waiting-requests`);
    console.log('API Response:', data); // Debugging
    dispatch({ type: SET_WITHDRAWAL_DATA,   payload: data || [] });
  } catch (error) {
    dispatch({
      type: FETCH_WITHDRAWAL_FAILURE,
      payload: error.message,
    });
  }
};

export const updateCoinRate  = (coinRate) => async (dispatch) => {
   // Ensure the coinRate is a valid number (strip quotes if any)
   const validCoinRate = parseFloat(coinRate);

   if (isNaN(validCoinRate)) {
     dispatch({ type: UPDATE_COIN_RATE_FAILURE, payload: 'Invalid coin rate provided.' });
     return;
   }
  try {
    // Call the fetcherPost function for the transfer coins API
    const response = await fetcherPost(`${BACKEND_URL}/api/v1/api-coinrate-update`, { coin_rate: validCoinRate } );

    console.log("Coin update successful:", response);
    dispatch({ type: UPDATE_COIN_RATE_SUCCESS , payload: response });
    toast.success("Coins update successfully!");
  } catch (error) {
    console.error("Transfer failed:", error.message);
    dispatch({
      type: UPDATE_COIN_RATE_FAILURE ,
      payload: error.message,
    });
    toast.error("Failed to transfer coins.");
  }
};

export const userApprove = (transaction_id) => async (dispatch) => {
  try {
    // Call the fetcherPost function for the transfer coins API
    const response = await fetcherPost(`${BACKEND_URL}/api/v1/user-approve`, transaction_id);

    console.log("Transfer successful:", response);
    dispatch({ type: USER_APPROVE_SUCCESS, payload: response });
    // toast.success("Coins transferred successfully!");
  } catch (error) {
    console.error("Transfer failed:", error.message);
    dispatch({
      type: USER_APPROVE_FAILURE,
      payload: error.message,
    });
    toast.error("Failed to transfer coins.");
  }
};


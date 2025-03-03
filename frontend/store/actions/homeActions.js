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

export const FETCH_COIN_REQUEST = 'FETCH_COIN_REQUEST';
export const SET_COIN_DATA  = 'SET_COIN_DATA';
export const FETCH_COIN_FAILURE = 'FETCH_COIN_FAILURE';

export const FETCH_REFFRAL_REQUEST = 'FETCH_REFFRAL_REQUEST';
export const SET_REFFRAL_DATA  = 'SET_REFFRAL_DATA';
export const FETCH_REFFRAL_FAILURE = 'FETCH_REFFRAL_FAILURE';

export const FETCH_HISTORY_REQUEST = 'FETCH_HISTORY_REQUEST';
export const SET_HISTORY_DATA  = 'SET_HISTORY_DATA';
export const FETCH_HISTORY_FAILURE = 'FETCH_HISTORY_FAILURE';

export const FETCH_QUEST_HISTORY_REQUEST = 'FETCH_QUEST_HISTORY_REQUEST';
export const SET_QUEST_HISTORY_DATA  = 'SET_QUEST_HISTORY_DATA';
export const FETCH_QUEST_HISTORY_FAILURE = 'FETCH_QUEST_HISTORY_FAILURE';

export const FETCH_WITHDRAWAL_REQUEST = 'FETCH_WITHDRAWAL_REQUEST';
export const SET_WITHDRAWAL_DATA  = 'SET_WITHDRAWAL_DATA';
export const FETCH_WITHDRAWAL_FAILURE = 'FETCH_WITHDRAWAL_FAILURE';

export const FETCH_STATS_REQUEST = 'FETCH_STATS_REQUEST';
export const SET_STATS_DATA  = 'SET_STATS_DATA';
export const FETCH_STATS_FAILURE = 'FETCH_STATS_FAILURE';

export const TRANSFER_COINS_REQUEST = "TRANSFER_COINS_REQUEST";
export const TRANSFER_COINS_SUCCESS = "TRANSFER_COINS_SUCCESS";
export const TRANSFER_COINS_FAILURE = "TRANSFER_COINS_FAILURE";

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
const fetchCoinRequest = () => {
  return {
    type: FETCH_COIN_REQUEST,
  };
};

// Fetch User Success Action
const setCoinData  = (data) => {
  return {
    type: SET_COIN_DATA,
    payload: data,
  };
};

// Fetch User Failure Action
const fetchCoinFailure = (error) => {
  return {
    type: FETCH_COIN_FAILURE,
    payload: error,
  };
};

export const fetchMeData = () => async (dispatch) => {
  dispatch(fetchMeRequest());
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/api-me`);
    dispatch(setMeData(data));
  } catch (error) {
    dispatch(fetchMeFailure(error.message));
  }
};
export const fetchCoinData = () => async (dispatch) => {
  dispatch(fetchCoinRequest());
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/pending-coins`);
    dispatch(setCoinData(data));
  } catch (error) {
    dispatch(fetchCoinFailure(error.message));
  }
};

export const fetchReffralData = () => async (dispatch) => {
  dispatch({type: FETCH_REFFRAL_REQUEST});
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/referral-code`);
    dispatch({ type: SET_REFFRAL_DATA, payload: data });
  } catch (error) {
    dispatch({
      type: FETCH_REFFRAL_FAILURE,
      payload: error.message,
    });
  }
};
export const fetchHistory = () => async (dispatch) => {
  dispatch({type: FETCH_HISTORY_REQUEST});
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/user-history`);
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

export const fetchStats = () => async (dispatch) => {
  dispatch({type: FETCH_STATS_REQUEST});
  
  try {
    const data = await fetcherGet(`${BACKEND_URL}/api/v1/stats-data`);
    console.log('API Response:', data); // Debugging
    dispatch({ type: SET_STATS_DATA,   payload: data || [] });
  } catch (error) {
    dispatch({
      type: FETCH_STATS_FAILURE,
      payload: error.message,
    });
  }
};

export const transferCoins = (coinData) => async (dispatch) => {
  try {
    // Call the fetcherPost function for the transfer coins API
    const response = await fetcherPost(`${BACKEND_URL}/api/v1/transfer-coins`, coinData);

    console.log("Transfer successful:", response);
    dispatch({ type: TRANSFER_COINS_SUCCESS, payload: response });
    // toast.success("Coins transferred successfully!");
  } catch (error) {
    console.error("Transfer failed:", error.message);
    dispatch({
      type: TRANSFER_COINS_FAILURE,
      payload: error.message,
    });
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


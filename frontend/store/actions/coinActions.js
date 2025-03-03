import {  fetcherPost } from '../fetcher';  
import { BACKEND_URL } from '../../src/config';
import { toast } from "react-toastify";


export const SHARE_COINS_REQUEST = "SHARE_COINS_REQUEST";
export const SET_COINS_SUCCESS = "SET_COINS_SUCCESS";
export const SHARE_COINS_FAILURE = "SHARE_COINS_FAILURE";


export const shareCoins = (amount, recipientReferralCode) => async (dispatch) => {
  dispatch({ type: SHARE_COINS_REQUEST });
  try {
    const response = await fetcherPost(`${BACKEND_URL}/api/v1/api-coin-share`, amount, recipientReferralCode );

    dispatch({ type: SET_COINS_SUCCESS, payload: response });
    toast.success("Coins shared successfully!");
  } catch (error) {
    const errorMessage = error.message || "An unknown error occurred.";
    console.error("Caught Error:", errorMessage);
    dispatch({
      type: SHARE_COINS_FAILURE,
      payload: errorMessage,
    });
    toast.error(errorMessage); // Show backend error in toast
  }
};

import {  fetcherPost } from '../fetcher';  
import { BACKEND_URL } from '../../src/config';
import { toast } from "react-toastify";

export const SELL_COINS_REQUEST = "SELL_COINS_REQUEST";
export const SELL_COINS_SUCCESS = "SELL_COINS_SUCCESS";
export const SELL_COINS_FAILURE = "SELL_COINS_FAILURE";

// Generic action creator for POST requests
export const sellCoins = (transactionData) => async (dispatch) => {
    dispatch({ type: SELL_COINS_REQUEST });
    try {
      // Call the fetcherPost function for the transfer coins API
      const response = await fetcherPost(`${BACKEND_URL}/api/v1/sell-coin`, transactionData);
  
      console.log("Sell coin successful:", response);
      dispatch({ type: SELL_COINS_SUCCESS, payload: response });
      toast.success("Coin transaction completed successfully!");
    } catch (error) {
      console.error("Share failed:", error.message);
      dispatch({
        type: SELL_COINS_FAILURE,
        payload: error.message,
      });
      toast.error(error.message);
    }
  };

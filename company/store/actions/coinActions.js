import {  fetcherPost } from '../fetcher';  
import { BACKEND_URL } from '../../src/config';
import { toast } from "react-toastify";


export const SHARE_COINS_REQUEST = "SHARE_COINS_REQUEST";
export const SET_COINS_SUCCESS = "SET_COINS_SUCCESS";
export const SHARE_COINS_FAILURE = "SHARE_COINS_FAILURE";


export const shareCoins = (sell_coin, upi_id) => async (dispatch) => {
    dispatch({ type: SHARE_COINS_REQUEST });
    try {
      // Call the fetcherPost function for the transfer coins API
      const response = await fetcherPost(`${BACKEND_URL}/api/v1/sell-coins-toadmin`, sell_coin, upi_id);
  
      console.log("Share coin successful:", response);
      dispatch({ type: SET_COINS_SUCCESS, payload: response });
      toast.success("Coins Share successfully!");
    } catch (error) {
      console.error("Share failed:", error.message);
      dispatch({
        type: SHARE_COINS_FAILURE,
        payload: error.message,
      });
      toast.error("Failed to transfer coins.");
    }
  };
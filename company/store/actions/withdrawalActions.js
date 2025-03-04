import axios from 'axios';
import { BACKEND_URL } from '../../src/config';
import { toast } from "react-toastify";


export const UPLOAD_TRANSACTION_REQUEST = 'UPLOAD_TRANSACTION_REQUEST';
export const UPLOAD_TRANSACTION_SUCCESS = 'UPLOAD_TRANSACTION_SUCCESS';
export const UPLOAD_TRANSACTION_FAILURE = 'UPLOAD_TRANSACTION_FAILURE';



export const uploadTransactionDoc = (payload) => async (dispatch) => {
  try {
    dispatch({ type: UPLOAD_TRANSACTION_REQUEST });

    // Retrieve and parse token from localStorage
    const tokenData = localStorage.getItem('user');
    if (!tokenData) {
      throw new Error('No token data found in localStorage');
    }

    const parsedTokenData = JSON.parse(tokenData);
    const token = parsedTokenData.token;

    if (!token) {
      throw new Error('Token not found');
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('transaction_id', payload.transaction_id);
    if (payload.trans_id) {
      formData.append('trans_id', payload.trans_id);
    }
    if (payload.utr_no) {
      formData.append('utr_no', payload.utr_no);
    }
    if (payload.trans_doc) {
      formData.append('trans_doc', payload.trans_doc);
    }

    // Make the API request
    const response = await axios.post(`${BACKEND_URL}/api/v1/upload-transaction-doc`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`, // Include token in Authorization header
      },
    });

    // Dispatch success action
    dispatch({ type: UPLOAD_TRANSACTION_SUCCESS, payload: response.data });
    toast.success('Payment receipt uploaded successfully!');
  } catch (error) {
    // Dispatch failure action
    dispatch({
      type: UPLOAD_TRANSACTION_FAILURE,
      payload: error.response ? error.response.data : error.message,
    });

    // Display error notification
    toast.error('Failed to upload payment receipt!');
  }
};

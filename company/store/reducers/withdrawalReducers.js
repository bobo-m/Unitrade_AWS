// reducer.js
import { UPLOAD_TRANSACTION_SUCCESS , UPLOAD_TRANSACTION_FAILURE , UPLOAD_TRANSACTION_REQUEST  } from '../actions/withdrawalActions';

const initialState = {
    data: {},
    loading: false,
    error: null,
    success: false,
  };

const withdrawalReducers = (state = initialState, action) => {
    switch (action.type) {
      case UPLOAD_TRANSACTION_REQUEST:
        return { ...state, loading: true };
      case UPLOAD_TRANSACTION_SUCCESS:
        return { ...state, loading: false, success: true, data: action.payload };
      case UPLOAD_TRANSACTION_FAILURE:
        return { ...state, loading: false, success: false, error: action.payload };
        default:
          return state;
      }
};

export default withdrawalReducers;

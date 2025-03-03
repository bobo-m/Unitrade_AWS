// reducer.js
import { SELL_COINS_SUCCESS, SELL_COINS_FAILURE, SELL_COINS_REQUEST } from '../actions/withdrawalActions';

const initialState = {
    data: {},
    loading: false,
    error: null,
    success: false,
  };

const withdrawalReducers = (state = initialState, action) => {
    switch (action.type) {
        case SELL_COINS_REQUEST:
          return {
            ...state,
            loading: true,
            error: null,
            success: false,
          };
        case SELL_COINS_SUCCESS:
          return {
            ...state,
            loading: false,
            success: true,
            data: {
              ...state.data,
              sellCoins: action.payload,
            },
          };
        case SELL_COINS_FAILURE:
          return {
            ...state,
            loading: false,
            error: action.payload,
            success: false,
          };
        default:
          return state;
      }
};

export default withdrawalReducers;

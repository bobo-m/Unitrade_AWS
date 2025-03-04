import { SET_COINS_SUCCESS, SHARE_COINS_FAILURE, SHARE_COINS_REQUEST } from '../actions/coinActions';

const initialState = {
  data: {},
  loading: false,
  error: null,
  success: false,
};

const coinReducer = (state = initialState, action) => {
  switch (action.type) {
    case SHARE_COINS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };
    case SET_COINS_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        data: {
          ...state.data,
          shareCoins: action.payload,
        },
      };
    case SHARE_COINS_FAILURE:
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

export default coinReducer;

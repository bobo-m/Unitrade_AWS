// reducers/userReducer.js

import {
    USER_UPDATE_REQUEST,
    USER_UPDATE_SUCCESS,
    USER_UPDATE_FAILURE,
  } from '../actions/userActions';
  
  // Initial state
  const initialState = {
    userInfo: null,
    loading: false,
    success: false,
    error: null,
  };
  
  // Reducer to handle actions
  const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case USER_UPDATE_REQUEST:
        return { ...state, loading: true, success: false, error: null };
      case USER_UPDATE_SUCCESS:
        return { ...state, loading: false, success: true, userInfo: action.payload };
      case USER_UPDATE_FAILURE:
        return { ...state, loading: false, success: false, error: action.payload };
      default:
        return state;
    }
  };
  
  export default userReducer;
  
const initialState = {
  data: {},    // Store all API response data
  loading: {}, // Store loading states of various APIs
  error: {}    // Store error messages for different APIs
};

const homeReducer = (state = initialState, action) => {
  const { type, payload, error } = action;

  // Handle loading state
  if (type.startsWith('FETCH_') && type.endsWith('_REQUEST')) {
    const apiName = type.split('_')[1].toLowerCase();
    return {
      ...state,
      loading: {
        ...state.loading,
        [apiName]: true,
      },
      error: {
        ...state.error,
        [apiName]: null, // Reset any previous errors
      }
    };
  }

  // Handle success state
  if (type.startsWith('SET_') && type.endsWith('_DATA')) {
    const apiName = type.split('_')[1].toLowerCase();
    return {
      ...state,
      data: {
        ...state.data,
        [apiName]: payload,
      },
      loading: {
        ...state.loading,
        [apiName]: false,
      }
    };
  }

  // Handle error state
  if (type.startsWith('FETCH_') && type.endsWith('_FAILURE')) {
    const apiName = type.split('_')[1].toLowerCase();
    return {
      ...state,
      loading: {
        ...state.loading,
        [apiName]: false,
      },
      error: {
        ...state.error,
        [apiName]: error,
      }
    };
  }

  return state;
};

export default homeReducer;

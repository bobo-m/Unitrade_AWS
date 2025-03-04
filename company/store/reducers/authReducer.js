import { LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from '../actions/authActions';
import { SIGNUP_SUCCESS, SIGNUP_FAILURE } from '../actions/authActions';
import { PASSWORD_RESET_REQUEST, PASSWORD_RESET_SUCCESS, PASSWORD_RESET_FAILURE, } from '../actions/authActions';
import { PASSWORD_UPDATE_REQUEST, PASSWORD_UPDATE_SUCCESS, PASSWORD_UPDATE_FAIL, CLEAR_AUTH_STATE,} from '../actions/authActions';

const initialState = {
  user: typeof window !== 'undefined' && localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null,
  error: null,
  loading: false,
  message: '',
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {


    case PASSWORD_UPDATE_REQUEST:
      return { ...state, loading: true };
  case PASSWORD_UPDATE_SUCCESS:
      return { ...state, loading: false, message: action.payload };
  case PASSWORD_UPDATE_FAIL:
      return { ...state, loading: false, error: action.payload };
      case CLEAR_AUTH_STATE:
        return { ...state, message: null, error: null }; 
        

    case PASSWORD_RESET_REQUEST:
      return { ...state, loading: true };
  case PASSWORD_RESET_SUCCESS:
      return { ...state, loading: false, message: action.payload };
  case PASSWORD_RESET_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case SIGNUP_SUCCESS:
      return {
        ...state,
        user: action.payload,
        error: null,
      };
    case SIGNUP_FAILURE:
      return {
        ...state,
        user: null,
        error: action.payload,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        error: null,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        error: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        user: null,
        error: null,
      };
    default:
      return state;
  }
};

export default authReducer;

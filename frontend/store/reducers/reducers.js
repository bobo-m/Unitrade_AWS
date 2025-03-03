import { combineReducers } from 'redux';
import homeReducer from './homeReducer';
import withdrawalReducers from './withdrawalReducers';
import coinReducer from './coinReducer';
import userReducer from './userReducer';
import authReducer from './authReducer';

const rootReducer = combineReducers({
  apiData: homeReducer,
  moneyData: withdrawalReducers,
  coinData: coinReducer,
  user: userReducer,
  auth: authReducer,
});

export default rootReducer;
import { combineReducers } from 'redux'
import authReducer from './authReducer'
import instanceReducer from './instanceReducer'
import apiReducer from './apiReducer'
import applicationReducer from './applicationReducer'
import loadingReducer from './loadingReducer'
import notificationReducer from './notificationReducer'
import menu from './menu'
import mainmenuReducer from './mainmenuReducer'
import billingReducer from './billingReducer'

const rootReducer = combineReducers({
  mainmenu: mainmenuReducer,
  auth: authReducer,
  billing: billingReducer,
  instance: instanceReducer,
  API: apiReducer,
  application: applicationReducer,
  menu: menu,
  notification: notificationReducer,
  loading: loadingReducer
})
export default rootReducer

const initState = {
  uid: '',
  organizationID: '',
  registered: false,
  user: {},
  invitedInfo: {},
  loading: false,
  styleMode: 'light'
}
const authReducer = (state = initState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        uid: action.user?.id,
        user: { ...action.user }
      }
    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        uid: '',
        loading: false,
        user: {}
      }
    case 'UPDATE_STYLE_MODE':
      return {
        ...state,
        styleMode: action.payload
      }
    case 'GET_INVITED_EMAIL':
      return {
        ...state,
        invitedInfo: action.payload
      }
    case 'SELECT_ORGANIZATION':
      return {
        ...state,
        organizationID: action.payload
      }
    default:
      return {
        ...state
      }
  }
}
export default authReducer

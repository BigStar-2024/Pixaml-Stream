const initState = {
  allAPIKeys: null,
  loading: false
}
const authReducer = (state = initState, action) => {
  switch (action.type) {
    case 'GET_API_KEYS':
      return {
        ...state,
        allAPIKeys: action.payload
      }
    case 'API_LOADING_TRUE':
      return {
        ...state,
        loading: true
      }
    case 'API_LOADING_FALSE':
      return {
        ...state,
        loading: false
      }
    default:
      return {
        ...state
      }
  }
}
export default authReducer

const initState = {
  allAPP: {},
  loading: false,
  currentAPP: {},
  distributions: [],
  currentDistribution: {}
}
const applicationReducer = (state = initState, action) => {
  switch (action.type) {
    case 'GET_APP':
      return {
        ...state,
        allAPP: action.payload
      }
    case 'GET_CURRENT_APP':
      return {
        ...state,
        currentAPP: action.payload
      }
    case 'GET_DISTRIBUTION_BY_APP':
      return {
        ...state,
        distributions: action.payload
      }
    case 'GET_DISTRIBUTION_BY_ID':
      return {
        ...state,
        currentDistribution: action.payload
      }
    case 'APP_LOADING_TRUE':
      return {
        ...state,
        loading: true
      }
    case 'APP_LOADING_FALSE':
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
export default applicationReducer

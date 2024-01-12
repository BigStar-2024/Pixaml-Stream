const initState = {
  loading: false
}
const loadingReducer = (state = initState, action) => {
  switch (action.type) {
    case 'LOADING_TRUE':
      return {
        ...state,
        loading: true
      }
    case 'LOADING_FALSE':
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
export default loadingReducer

const initState = {
  allInstance: [],
  loading: false
}
const instanceReducer = (state = initState, action) => {
  switch (action.type) {
    case 'GET_INSTANCES':
      return {
        ...state,
        allInstance: action.payload
      }
    default:
      return {
        ...state
      }
  }
}
export default instanceReducer

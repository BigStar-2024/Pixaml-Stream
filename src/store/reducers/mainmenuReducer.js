const initState = {
  organizations: []
}

const mainmenuReducer = (state = initState, action) => {
  switch (action.type) {
    case 'GET_ORGANIZATIONS':
      return {
        ...state,
        organizations: action.payload
      }
    default:
      return {
        ...state
      }
  }
}
export default mainmenuReducer

const initState = {
  notifications: [],
  unread: [],
  loading: false
}
const notificationReducer = (state = initState, action) => {
  switch (action.type) {
    case 'GET_UNREAD':
      return {
        ...state,
        unread: action.payload
      }
    default:
      return {
        ...state
      }
  }
}
export default notificationReducer

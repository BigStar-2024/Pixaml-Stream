const initState = {
  customer: '',
  cards: [],
  customerInfo: {}
}
const billingReducer = (state = initState, action) => {
  switch (action.type) {
    case 'GET_CUSTOMER':
      return {
        ...state,
        customer: action.payload
      }
    case 'GET_CARDS':
      return {
        ...state,
        cards: action.payload
      }
    case 'GET_CUSTOMER_INFO':
      return {
        ...state,
        customerInfo: action.payload
      }
    case 'UPDATE_CUSTOMER_INFO':
      return {
        ...state,
        customerInfo: action.payload
      }
    case 'INIT_BILLING':
      return {
        ...state
      }
    default:
      return {
        ...state
      }
  }
}
export default billingReducer

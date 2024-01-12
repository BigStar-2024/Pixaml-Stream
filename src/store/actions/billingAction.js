import { toast } from 'react-toastify'
import firebase from '../../config/firebase'
import axios from 'axios'

const URL = 'http://127.0.0.1:5001/pixal-stream-dev/us-central1/app'
// const URL = 'https://us-central1-pixal-stream-dev.cloudfunctions.net/app'

export const getCustomerID = id => async dispatch => {
  try {
    const customer = await firebase.firestore().collection('customers').doc(id).get()

    dispatch({
      type: 'GET_CUSTOMER',
      payload: customer.data()
    })
  } catch (error) {
    toast.error(error.message)
  }
}

export const attachPaymentMethod = (userId, body, onSuccess) => async dispatch => {
  dispatch({
    type: 'LOADING_TRUE'
  })

  await axios
    .post(`${URL}/payment/attach-payment-method`, body)
    .then(res => {
      savePaymentMethod(userId, body.paymentMethodId)
      onSuccess()
      dispatch({
        type: 'LOADING_FALSE'
      })
    })
    .catch(err => {
      dispatch({
        type: 'LOADING_FALSE'
      })

      toast.error(err.message)
    })
}

const savePaymentMethod = async (userId, id) => {
  const previous = await firebase.firestore().collection('users').doc(userId).get()

  let previousId = []
  if (previous.data().cards) {
    previousId = previous.data().cards
  }
  previousId.push(id)
  await firebase
    .firestore()
    .collection('users')
    .doc(userId)
    .update({
      cards: previousId
    })
    .then(
      toast.success('You added new payment method.', {
        style: {
          fontFamily: 'Poppins'
        }
      })
    )
    .catch(err => {
      toast.error(err.message)
    })
}

export const getPaymentMethodByUser = (customerID, cards) => async dispatch => {
  const body = {
    customerID,
    cards: cards
  }
  await axios
    .post(`${URL}/payment/get-payment-method`, body)
    .then(res => {
      dispatch({
        type: 'GET_CARDS',
        payload: res.data.cards
      })
      dispatch({
        type: 'GET_CUSTOMER_INFO',
        payload: res.data.customerInfo
      })
    })
    .catch(err => {
      toast.error(err.message)
    })
}

export const deletePaymentMethodByUser = (paymentMethodId, onSuccess) => async dispatch => {
  dispatch({
    type: 'LOADING_TRUE',
    payload: true
  })
  const body = {
    paymentMethodId: paymentMethodId
  }
  await axios
    .post(`${URL}/payment/delete-payment-method`, body)
    .then(res => {
      onSuccess()
      dispatch({
        type: 'LOADING_FALSE',
        payload: false
      })
    })
    .catch(err => {
      dispatch({
        type: 'LOADING_FALSE',
        payload: false
      })

      toast.error(err.message)
    })
}

export const removePaymentMethodId = (userId, id) => async dispatch => {
  dispatch({
    type: 'LOADING_TRUE',
    payload: true
  })

  try {
    const removed = await firebase.firestore().collection('users').doc(userId).get()

    let newCards = []
    if (removed.data().cards) {
      newCards = removed.data().cards.filter(card => card !== id)
    }

    await firebase
      .firestore()
      .collection('users')
      .doc(userId)
      .update({
        cards: newCards
      })
      .then(() => {
        dispatch({
          type: 'LOADING_FALSE',
          payload: false
        })

        toast.success('You deleted current card successfully.')
      })
  } catch (error) {
    dispatch({
      type: 'LOADING_FALSE',
      payload: false
    })

    toast.error(error.message, {
      style: {
        fontFamily: 'Poppins'
      }
    })
  }
}

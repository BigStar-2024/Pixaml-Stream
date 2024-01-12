import { toast } from 'react-toastify'
import firebase from '../../config/firebase'

export const addNotification = (org_id, userID, type, title) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    await firebase
      .firestore()
      .collection('notifications')
      .add({
        org_id,
        userID,
        type,
        title,
        checked: false,
        createdAt: firebase.firestore.Timestamp.now()
      })
      .then(() => {})
      .catch(error => toast.error(error.message))

    dispatch({
      type: 'LOADING_FALSE'
    })
  } catch (error) {
    toast.error(error.message)

    dispatch({
      type: 'LOADING_FALSE'
    })
  }
}

export const updateCheckedStatus = id => async dispatch => {
  try {
    await firebase
      .firestore()
      .collection('notifications')
      .doc(id)
      .update({
        checked: true
      })
      .then(() => {
        console.log('Readed')
      })
      .catch(error => {
        console.log(error.message)
      })
  } catch (error) {
    console.log(error.message)
  }
}

export const deleteNotification = (id, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    await firebase
      .firestore()
      .collection('notifications')
      .doc(id)
      .delete()
      .then(() => onSuccess())
      .catch(error => toast.error(error.message))

    dispatch({
      type: 'LOADING_FALSE'
    })
  } catch (error) {
    toast.error(error.message)

    dispatch({
      type: 'LOADING_FALSE'
    })
  }
}

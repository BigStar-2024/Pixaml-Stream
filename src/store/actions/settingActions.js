import { toast } from 'react-toastify'
import firebase from '../../config/firebase'

export const updateUserName = (id, fullName, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    await firebase
      .firestore()
      .collection('users')
      .doc(id)
      .update({
        fullName
      })
      .then(() => {
        onSuccess()
      })
      .catch(err => toast.error(err.message))

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

export const updatePassword = (currentPassword, newPassword, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    const user = await firebase.auth().currentUser

    const credential = await firebase.auth.EmailAuthProvider.credential(user.email, currentPassword)

    user
      .reauthenticateWithCredential(credential)
      .then(() => {
        user
          .updatePassword(newPassword)
          .then(() => onSuccess())
          .catch(error => toast.error(error.message))
      })
      .catch(error => toast.error('Current password is incorrect'))

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

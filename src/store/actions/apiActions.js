import { toast } from 'react-toastify'
import firebase from '../../config/firebase'

export const newAPIAdd = (org_id, name, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'API_LOADING_TRUE'
    })

    const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)

    await organizationRef
      .collection('APIKeys')
      .add({
        name,
        status: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => onSuccess())
      .catch(error => toast.error(error.message))

    dispatch({
      type: 'API_LOADING_FALSE'
    })
  } catch (error) {
    toast.error(error.message)

    dispatch({
      type: 'API_LOADING_FALSE'
    })
  }
}

export const deactiveAPIKey = (org_id, id, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'API_LOADING_TRUE'
    })

    const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)

    await organizationRef
      .collection('APIKeys')
      .doc(id)
      .update({
        status: false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => onSuccess())
      .catch(error => toast.error(error.message))

    dispatch({
      type: 'API_LOADING_FALSE'
    })
  } catch (error) {
    toast.error(error.message)

    dispatch({
      type: 'API_LOADING_FALSE'
    })
  }
}

import { toast } from 'react-toastify'
import firebase from '../../config/firebase'
import { addNotification } from './notificationAction'

export const createOrganization = (organizationName, userInfo, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    await firebase
      .firestore()
      .collection('organizations')
      .add({
        organization: organizationName,
        createdAt: firebase.firestore.Timestamp.now()
      })
      .then(doc => {
        dispatch(addNotification(doc.id, userInfo.id, 'CREATE_ORG', `Created new organization - ${organizationName}`))

        doc.collection('users').doc(userInfo.id).set({
          uid: userInfo.id,
          email: userInfo.email,
          organizationID: doc.id,
          storageCapacity: 25000000000,
          role: 'admin',
          type: 'Created',
          createdAt: firebase.firestore.Timestamp.now()
        })

        onSuccess()
      })
      .catch(error => console.log(error.message))

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

export const getOrganization = (org_id, onSuccess) => async dispatch => {
  try {
    await firebase
      .firestore()
      .collection('organizations')
      .doc(org_id)
      .get()
      .then(doc => {
        onSuccess(doc.data())
      })
      .catch(error => console.log(error.message))
  } catch (error) {
    console.log(error.message)
  }
}

export const removeOrganization = (org_id, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    await firebase
      .firestore()
      .collection('organizations')
      .doc(org_id)
      .delete()
      .then(() => {
        onSuccess()
      })
      .catch(error => console.log(error.message))

    dispatch({
      type: 'LOADING_FALSE'
    })
  } catch (error) {
    console.log(error.message)

    dispatch({
      type: 'LOADING_FALSE'
    })
  }
}

export const updateOrganization = (org_id, organizationInfo, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    await firebase
      .firestore()
      .collection('organizations')
      .doc(org_id)
      .update({
        ...organizationInfo
      })
      .then(() => {
        onSuccess()
      })
      .catch(error => console.log(error.message))

    dispatch({
      type: 'LOADING_FALSE'
    })
  } catch (error) {
    console.log(error.message)

    dispatch({
      type: 'LOADING_FALSE'
    })
  }
}

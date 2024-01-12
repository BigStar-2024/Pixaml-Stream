import { toast } from 'react-toastify'
import firebase from '../../config/firebase'

export const newInstance = (org_id, app_id, onSuccess) => async dispatch => {
  try {
    const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)
    const applicationRef = await organizationRef.collection('applications').doc(app_id)

    await applicationRef
      .collection('instances')
      .add({
        name: 'Created new application',
        createdAt: firebase.firestore.Timestamp.now()
      })
      .then(() => {
        applicationRef.get().then(doc => {
          const count = doc.data().instanceCount + 1

          applicationRef
            .update({
              instanceCount: count
            })
            .then(() => {
              onSuccess()
            })
        })
      })
      .catch(error => toast.error(error.message))
  } catch (error) {
    toast.error(error.message)
  }
}

export const getCurrentApplication = (org_id, app_id) => async dispatch => {
  try {
    const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)
    await organizationRef
      .collection('applications')
      .doc(app_id)
      .get()
      .then(doc => {
        dispatch({
          type: 'GET_CURRENT_APP',
          payload: doc.data()
        })
      })
      .catch(err => {
        toast.error.err.message
      })
  } catch (error) {
    toast.error(error.message)
  }
}

export const deleteApplication = (org_id, id, onSuccess) => async dispatch => {
  dispatch({
    type: 'LOADING_TRUE'
  })
  try {
    const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)
    await organizationRef
      .collection('applications')
      .doc(id)
      .update({
        status: 'disabled'
      })
      .then(() => {
        onSuccess()
      })
      .catch(err => {
        toast.error.err.message
      })

    dispatch({
      type: 'LOADING_FALSE'
    })
  } catch (error) {
    toast.error(error.message)
  }
}

export const getDistributionByApplication = (org_id, app_id, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    let distributions = []
    const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)
    const applicationRef = await organizationRef.collection('applications').doc(app_id)

    await applicationRef
      .collection('distributions')
      .get()
      .then(snapShot => {
        onSuccess()
        snapShot.forEach(doc => {
          distributions.push(doc.data())
        })
        dispatch({
          type: 'GET_DISTRIBUTION_BY_APP',
          payload: distributions
        })
      })
      .catch(err => {
        toast.error.err.message
      })

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

export const getDistributionByID = (org_id, app_id, distribution_id) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)
    const applicationRef = await organizationRef.collection('applications').doc(app_id)

    await applicationRef
      .collection('distributions')
      .doc(distribution_id)
      .get()
      .then(doc => {
        dispatch({
          type: 'GET_DISTRIBUTION_BY_ID',
          payload: doc.data()
        })
      })
      .catch(err => {
        toast.error.err.message
      })

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

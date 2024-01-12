import { toast } from 'react-toastify'
import firebase from '../../config/firebase'

export const getInstances = organizationID => async dispatch => {
  try {
    const docRef = await firebase.firestore().collection('organizations').doc(organizationID)
    const applicationRef = await docRef.collection('applications').get()

    const allInstances = []

    // Use map to create an array of promises
    const instancePromise = applicationRef.docs.map(async application => {
      await application.ref
        .collection('instances')
        .get()
        .then(instances =>
          instances.docs.map(async instance => {
            allInstances.push({ id: instance.id, ...instance.data() })
          })
        )
    })

    // Wait for all promises to resolve
    await Promise.all(instancePromise)

    // Dispatch action after all asynchronous operations are done
    dispatch({
      type: 'GET_INSTANCES',
      payload: allInstances
    })
  } catch (error) {
    toast.error(error.message)
  }
}

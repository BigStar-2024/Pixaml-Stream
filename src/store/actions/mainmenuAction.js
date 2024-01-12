import { toast } from 'react-toastify'
import firebase from '../../config/firebase'

export const getOrganizations = userID => async dispatch => {
  try {
    const orgSnapshot = await firebase.firestore().collection('organizations').get()

    const organizations = []

    // Use map to create an array of promises
    const orgPromises = orgSnapshot.docs.map(async org => {
      const userDoc = await org.ref.collection('users').doc(userID).get()

      if (userDoc.exists) {
        organizations.push({ id: org.id, ...org.data() })
      }
    })

    // Wait for all promises to resolve
    await Promise.all(orgPromises)

    // Dispatch action after all asynchronous operations are done
    dispatch({
      type: 'GET_ORGANIZATIONS',
      payload: organizations
    })
  } catch (error) {
    console.log(error.message)
  }
}

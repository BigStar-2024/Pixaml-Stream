import { toast } from 'react-toastify'
import firebase from '../../config/firebase'
import { v4 as uuidv4 } from 'uuid'

function generateRandomToken () {
  const token = uuidv4()
  return token
}

export const sendInvitation = (org_id, email, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    const token = generateRandomToken()

    const createdAt = firebase.firestore.Timestamp.now()
    const expiresAt = new Date(createdAt.toMillis() + 7 * 24 * 60 * 60 * 1000)

    const info = {
      to: email,
      message: {
        subject: 'Invitation from Pixal Stream!',
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f0f0f0;
                }
                .message-container {
                  border: 2px solid #333;
                  padding: 10px;
                  background-color: #fff;
                }
                .fontsize {
                  font-size: 15px
                }
              </style>
            </head>
            <body>
              <div class="message-container">
                <h1 style="color: #007bff;">Invitation from Pixal Stream!</h1>
                <div class="fontsize">
                  <p>This is a invitation code from Pixal Stream.</p>
                  <p>Your invitation code: <a href='https://pixal-stream-dev.web.app/invite/login/${token}'> Go to Pixal Stream </a></p>
                </div>
              </div>
            </body>
          </html>
        `
      },
      organizationID: org_id,
      token: token,
      createdAt,
      expiresAt
    }

    await firebase
      .firestore()
      .collection('invitation')
      .doc(token)
      .set(info)
      .then(doc => {
        onSuccess()
      })
      .catch(error => {
        toast.error(error.message)
      })

    dispatch({
      type: 'LOADING_FALSE'
    })
  } catch (error) {
    dispatch({
      type: 'LOADING_FALSE'
    })

    toast.error(error.message)
  }
}

export const removeUserFromOrganization = (org_id, userID, onSuccess) => async dispatch => {
  try {
    const organizationRef = await firebase.firestore().collection('organizations').doc(org_id)
    await organizationRef
      .collection('users')
      .doc(userID)
      .delete()
      .then(() => {
        onSuccess()
      })
  } catch (error) {
    toast.error(error.message)
  }
}

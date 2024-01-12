import { toast } from 'react-toastify'
import firebase from '../../config/firebase'
import { provider } from '../../config/firebase'

const URL = 'http://127.0.0.1:5001/pixal-stream-dev/us-central1/app'
// const URL = 'https://us-central1-pixal-stream-dev.cloudfunctions.net/app'

function createData (deviceID, name, status, type, configuration) {
  return { deviceID: deviceID, name: name, status: status, type: type, configuration: configuration }
}

const devicesInfo = [
  createData(84564564, 'Camera Lens', true, 'remote', 'test1'),
  createData(98764564, 'Laptop', false, 'onsite', 'test1'),
  createData(98756325, 'Mobile', true, 'remote', 'test1'),
  createData(98652366, 'Handset', true, 'remote', 'test1'),
  createData(13286564, 'Computer Accessories', true, 'onsite', 'test1'),
  createData(86739658, 'TV', false, 'onsite', 'test1'),
  createData(13256498, 'Keyboard', false, 'remote', 'test1'),
  createData(98753263, 'Mouse', true, 'remote', 'test1'),
  createData(98753275, 'Desktop', true, 'onsite', 'test1'),
  createData(98753291, 'Chair', false, 'onsite', 'test1')
]

function generateRandomSixDigits () {
  // Generate a random number between 0 and 999999 (6 digits)
  const randomNumber = Math.floor(Math.random() * 1000000)

  // Ensure it has 6 digits by formatting with leading zeros if necessary
  const randomSixDigits = randomNumber.toString().padStart(6, '0')

  return randomSixDigits.toString()
}

export const sendEmailViaFirebase = (email, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    const verificationCode = generateRandomSixDigits()

    const info = {
      to: email,
      message: {
        subject: 'Hello from Pixal Stream!',
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
                <h1 style="color: #007bff;">Hello from Pixal Stream!</h1>
                <div class="fontsize">
                  <p>This is a verification email from Pixal Stream.</p>
                  <p>Your verification code: <b> ${verificationCode} </b></p>
                </div>
              </div>
            </body>
          </html>
        `,
        code: verificationCode
      }
    }

    await firebase
      .firestore()
      .collection('mail')
      .add(info)
      .then(doc => {
        onSuccess(doc.id)
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

export const verifyCodeCheck = (code, codeID, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    await firebase
      .firestore()
      .collection('mail')
      .doc(codeID)
      .get()
      .then(doc => {
        if (doc.data().message.code == code) {
          onSuccess()
        } else {
          toast.error('Verification Fail!')
        }
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

const createSubscription = async userID => {
  try {
    await firebase
      .firestore()
      .collection('customers')
      .doc(userID)
      .get()
      .then(async doc => {
        const body = {
          customerID: doc.data().stripeId
        }
        await axios
          .post(`${URL}/create-subscription`, body)
          .then(res => {
            console.log(res)
          })
          .catch(err => {
            console.log(err.message)
          })
      })
  } catch (error) {
    console.log(error.message)
  }
}

export const signUpUser = (credential, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    const fullName = credential.fullName
    const email = credential.email
    const password = credential.password

    const organization = credential.organization

    await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(data => {
        const uid = data.user?.uid

        createSubscription(uid)

        firebase
          .firestore()
          .collection('organizations')
          .add({
            organization,
            createdAt: firebase.firestore.Timestamp.now()
          })
          .then(doc => {
            devicesInfo.map(device => {
              doc.collection('devices').add(device)
            })

            doc.collection('users').doc(uid).set({
              uid,
              email,
              organizationID: doc.id,
              storageCapacity: 25000000000,
              fullName,
              role: 'admin',
              type: 'Created',
              createdAt: firebase.firestore.Timestamp.now()
            })

            firebase.firestore().collection('users').doc(uid).set({
              uid,
              email,
              fullName,
              role: 'admin',
              createdAt: firebase.firestore.Timestamp.now()
            })

            onSuccess()
          })
          .catch(error => toast.error(error.message))
      })
      .catch(error => {
        toast.error(error.message)
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

export const signUpUserByInvite = (credential, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    const fullName = credential.fullName
    const email = credential.email
    const password = credential.password

    await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(data => {
        const uid = data.user?.uid

        createSubscription(uid)

        firebase.firestore().collection('users').doc(uid).set({
          uid: data.user?.uid,
          email: data.user?.email,
          fullName: fullName,
          role: 'user',
          createdAt: firebase.firestore.Timestamp.now()
        })

        onSuccess()
      })
      .catch(error => {
        toast.error(error.message)
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

export const signUpUserWithGoogle = async onSuccess => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    await firebase
      .auth()
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(data => {
        const uid = data.user?.uid
        const fullName = data.user?.displayName

        firebase
          .firestore()
          .collection('organizations')
          .add({
            organization,
            createdAt: firebase.firestore.Timestamp.now()
          })
          .then(doc => {
            devicesInfo.map(device => {
              doc.collection('devices').add(device)
            })

            doc.collection('users').add({
              uid: uid,
              email: data.user?.email,
              organizationID: doc.id,
              fullName: fullName,
              createdAt: firebase.firestore.Timestamp.now()
            })

            firebase.firestore().collection('users').doc(uid).set({
              uid: data.user?.uid,
              email: data.user?.email,
              organizationID: doc.id,
              fullName: fullName,
              createdAt: firebase.firestore.Timestamp.now()
            })

            onSuccess()
          })

        toast.success('Sign Up Success!')
      })
      .catch(err => {
        toast.error(err.message)
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

export const loginUser = (credential, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    const email = credential.email
    const password = credential.password

    await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(data => {
        const uid = data.user?.uid

        firebase
          .firestore()
          .collection('users')
          .doc(uid)
          .onSnapshot(async doc => {
            dispatch({
              type: 'LOGIN_SUCCESS',
              user: {
                id: doc.id,
                ...doc.data()
              }
            })
            onSuccess()
            toast.success('Login Success!')
          })
      })
      .catch(error => {
        toast.error('You must input correct credential')
      })

    dispatch({
      type: 'LOADING_FALSE'
    })
  } catch (error) {
    toast.error('You must input correct credential')

    dispatch({
      type: 'LOADING_FALSE'
    })
  }
}

export const loginUserByInvite = (credential, onSuccess) => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    const email = credential.email
    const password = credential.password
    const organizationID = credential.organizationID

    await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(data => {
        const uid = data.user?.uid
        console.log(uid)
        firebase
          .firestore()
          .collection('users')
          .doc(uid)
          .onSnapshot(async doc => {
            const organizationRef = firebase.firestore().collection('organizations').doc(organizationID)

            organizationRef.collection('users').doc(uid).set({
              uid: uid,
              email: email,
              organizationID: organizationID,
              storageCapacity: 25000000000,
              role: 'user',
              type: 'invited',
              createdAt: firebase.firestore.Timestamp.now()
            })
            console.log('first')
            dispatch({
              type: 'LOGIN_SUCCESS',
              user: {
                id: doc.id,
                ...doc.data()
              }
            })
            onSuccess()
            toast.success('Login Success!')
          })
      })
      .catch(error => {
        toast.error('You must input correct credential')
      })

    dispatch({
      type: 'LOADING_FALSE'
    })
  } catch (error) {
    toast.error('You must input correct credential')

    dispatch({
      type: 'LOADING_FALSE'
    })
  }
}

export const loginWithGoogle = onSuccess => async dispatch => {
  try {
    dispatch({
      type: 'LOADING_TRUE'
    })

    await firebase
      .auth()
      .signInWithPopup(provider)
      .then(data => {
        const uid = data.user?.uid

        firebase
          .firestore()
          .collection('users')
          .doc(uid)
          .onSnapshot(async doc => {
            dispatch({
              type: 'LOGIN_SUCCESS',
              user: {
                id: doc.id,
                ...doc.data()
              }
            })
            onSuccess()
            toast.success('Login Success!')
          })
      })
      .catch(err => {
        toast.error('You must input correct credential')
      })

    dispatch({
      type: 'LOADING_FALSE'
    })
  } catch (error) {
    toast.error('You must input correct credential')

    dispatch({
      type: 'LOADING_FALSE'
    })
  }
}

export const logout = onSuccess => {
  return dispatch => {
    firebase
      .auth()
      .signOut()
      .then(data => {
        dispatch({
          type: 'LOGOUT_SUCCESS',
          uid: '',
          user: {}
        })
        // dispatch({
        //   type: 'INIT_BILLING'
        // })
        onSuccess()
      })
      .catch(error => {
        dispatch({
          type: 'LOGOUT_FAIL',
          uid: ''
        })
      })
  }
}

export const forgetPassword =
  (email, onSuccess = () => {}) =>
  async dispatch => {
    dispatch(forgetLoader(true))
    try {
      await firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then(res => {
          dispatch(forgetLoader(false))
          enqueueSnackbar('Please check your email and reset the password')
          onSuccess()
        })
        .catch(err => {
          dispatch(forgetLoader(false))
          enqueueSnackbar(err.message)
        })
    } catch (error) {
      dispatch(forgetLoader(false))
      enqueueSnackbar(error.message)
    }
  }

export const reRegisterSnapshot = id => async dispatch => {
  await firebase
    .firestore()
    .collection('users')
    .doc(id)
    .onSnapshot(async doc => {
      dispatch({
        type: 'LOGIN_SUCCESS',
        user: {
          id: doc.id,
          ...doc.data()
        }
      })
    })

  dispatch({
    type: 'LOGIN_REQUEST_END'
  })
}

export const updateStyleMode = theme => async dispatch => {
  try {
    dispatch({
      type: 'UPDATE_STYLE_MODE',
      payload: theme
    })
  } catch (error) {
    console.log(error.message)
  }
}

export const getInviteEmailByToken = token => async dispatch => {
  try {
    await firebase
      .firestore()
      .collection('invitation')
      .doc(token)
      .get()
      .then(doc => {
        dispatch({
          type: 'GET_INVITED_EMAIL',
          payload: { id: doc.id, email: doc.data().to, organizationID: doc.data().organizationID, createdAt: doc.data().createdAt }
        })
      })
      .catch(error => console.log(error.message))
  } catch (error) {
    console.log(error.message)
  }
}

export const checkExpireTime = (token, onSuccess) => async dispatch => {
  try {
    await firebase
      .firestore()
      .collection('invitation')
      .doc(token)
      .get()
      .then(doc => {
        if (doc.exists) {
          const currentTime = firebase.firestore.Timestamp.now().toMillis()
          const expiresAt = doc.data().expiresAt.toMillis()
          onSuccess(currentTime, expiresAt)
        }
      })
      .catch(error => console.log(error.message))
  } catch (error) {
    console.log(error.message)
  }
}

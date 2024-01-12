import axios from 'axios'
import { toast } from 'react-toastify'

const baseDomain = 'https://us-central1-remotecc-ccb45.cloudfunctions.net/app/chatgpt'
// const baseDomain = 'http://localhost:5001/remotecc-ccb45/us-central1/app/chatgpt'

const baseURL = `${baseDomain}`

export const getResponse = async (payload, onSuccess) => {
  try {
    const question = {
      question: payload.question
    }
    await axios
      .post(`${baseURL}/get-response`, question)
      .then(res => {
        let { data } = res

        console.log('repository', data)
        onSuccess(res)
      })
      .catch(err => console.log(err?.message))
  } catch (error) {
    toast.error(error?.message)
  }
}

// @flow

import Axios from 'axios'

const post = async (path: string, payload: any, options = {}) => {
  // todo validateStatus
  try {
    return await Axios.post(
      `http://localhost:3000/${path.replace(/^\//, '')}`, // todo hostname per environment
      payload,
      options
    )
  } catch (e) {
    console.warn('Error completing POST request')
  }
}

export default {
  post,
}

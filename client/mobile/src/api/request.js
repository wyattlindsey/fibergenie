// @flow

import Axios from 'axios'

const post = async (path: string, payload: any, options = {}) => {
  try {
    return await Axios.post(
      `http://localhost:3000/${path.replace(/^\//, '')}`, // todo hostname per environment
      payload,
      options
    )
  } catch (e) {
    console.error('Error completing POST request: ', e)
  }
}

export default {
  post,
}

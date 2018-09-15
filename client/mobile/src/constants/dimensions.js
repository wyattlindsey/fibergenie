// @flow

import { Dimensions } from 'react-native'

const window = {
  fullHeight: Dimensions.get('window').height,
  fullWidth: Dimensions.get('window').width,
}

export default { window }

import React from 'react'
import { Text, View } from 'react-native'

import flexbox from 'styles/flexbox'

class CameraRoll extends React.Component {
  static navigationOptions = {
    title: 'Photo Library',
  }

  render() {
    return (
      <View style={flexbox.center}>
        <Text>CameraRoll</Text>
      </View>
    )
  }
}

export default CameraRoll

import React from 'react'
import { Text, View } from 'react-native'

import flexbox from 'styles/flexbox'

class Upload extends React.Component {
  static navigationOptions = {
    title: 'Upload',
  }

  render() {
    return (
      <View style={flexbox.center}>
        <Text>Upload</Text>
      </View>
    )
  }
}

export default Upload

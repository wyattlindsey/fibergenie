import React from 'react'
import { Text, View } from 'react-native'

import flexbox from 'styles/flexbox'

class Registration extends React.Component {
  static navigationOptions = {
    title: 'Registration',
  }

  render() {
    return (
      <View style={flexbox.center}>
        <Text>Registration</Text>
      </View>
    )
  }
}

export default Registration

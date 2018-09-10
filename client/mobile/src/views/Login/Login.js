import React from 'react'
import { Text, View } from 'react-native'

import flexbox from 'styles/flexbox'

class Login extends React.Component {
  static navigationOptions = {
    title: 'Login',
  }

  render() {
    return (
      <View style={flexbox.center}>
        <Text>Login</Text>
      </View>
    )
  }
}

export default Login

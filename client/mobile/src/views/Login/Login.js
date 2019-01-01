import React from 'react'
import { Text, TextInput, View } from 'react-native'

import flexbox from 'styles/flexbox'

class Login extends React.Component {
  static navigationOptions = {
    title: 'Login',
  }

  state = {
    text: '',
  }

  render() {
    return (
      <View style={flexbox.center}>
        <Text>Login</Text>
        <TextInput
          style={{
            height: 40,
            width: '80%',
            borderColor: 'gray',
            borderWidth: 1,
          }}
          onChangeText={text => this.setState({ text })}
          value={this.state.text}
        />
      </View>
    )
  }
}

export default Login

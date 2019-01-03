import React from 'react'
import { Text, TextInput, View } from 'react-native'

import flexbox from 'styles/flexbox'
import form from 'styles/form'
import layout from 'styles/layout'

const textInputStyle = {
  height: 40,
  width: '100%',
  borderColor: 'gray',
  borderWidth: 1,
}

const formWrapperStyle = {
  maxWidth: 400,
  width: '80%',
}

class Login extends React.Component {
  static navigationOptions = {
    title: 'Login',
  }

  state = {
    username: '',
    password: '',
  }

  render() {
    return (
      <View style={flexbox.center}>
        <View style={formWrapperStyle}>
          <View style={form.field}>
            <Text style={form.label}>Username</Text>
            <TextInput
              autoCapitalize="none"
              style={textInputStyle}
              onChangeText={username => this.setState({ username })}
              value={this.state.username}
            />
          </View>
          <Text style={form.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            style={textInputStyle}
            onChangeText={password => this.setState({ password })}
            secureTextEntry
            value={this.state.password}
          />
        </View>
      </View>
    )
  }
}

export default Login

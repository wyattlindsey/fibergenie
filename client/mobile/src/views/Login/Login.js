// @flow

import React from 'react'
import { Button, Text, TextInput, View } from 'react-native'

import flexbox from 'styles/flexbox'
import form from 'styles/form'

import SCREENS from 'constants/screens'

const registrationLinkStyle = {
  marginBottom: 32,
}

const formWrapperStyle = {
  maxWidth: 400,
  width: '80%',
}

const textInputStyle = {
  height: 40,
  width: '100%',
  borderColor: 'gray',
  borderWidth: 1,
}

const buttonStyle = {
  marginTop: 16,
}

const REGISTRATION_TEXT = 'Don\'t have an account?'

type Props = {
  navigation: { [any]: any },
}

type State = {
  username: string,
  password: string,
}

class Login extends React.Component<Props, State> {
  state = {
    username: '',
    password: '',
  }

  static navigationOptions = {
    title: 'Login',
  }

  handleRegistrationPress = () => {
    const {
      navigation: { navigate },
    } = this.props // eslint-disable-line react/prop-types
    navigate({ key: SCREENS.REGISTRATION, routeName: SCREENS.REGISTRATION })
  }

  handleSubmit() {}

  render() {
    const { password, username } = this.state

    return (
      <View style={flexbox.center}>
        <View style={registrationLinkStyle}>
          <Text>{REGISTRATION_TEXT}</Text>
          <Button onPress={this.handleRegistrationPress} title="Register" />
        </View>
        <View style={formWrapperStyle}>
          <View style={form.field}>
            <Text style={form.label}>Username</Text>
            <TextInput
              autoCapitalize="none"
              style={textInputStyle}
              onChangeText={v => this.setState({ username: v })}
              value={username}
            />
          </View>
          <Text style={form.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            style={textInputStyle}
            onChangeText={v => this.setState({ password: v })}
            secureTextEntry
            value={password}
          />
          <View style={buttonStyle}>
            <Button
              onPress={this.handleSubmit}
              style={buttonStyle}
              title="Login"
            />
          </View>
        </View>
      </View>
    )
  }
}

export default Login

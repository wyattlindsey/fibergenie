// @flow

import React from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import { SecureStore } from 'expo'
import { Formik } from 'formik'
import makeInputGreatAgain, {
  handleTextInput,
  withNextInputAutoFocusForm,
  withNextInputAutoFocusInput,
} from 'react-native-formik'
import Toaster, { ToastStyles } from 'react-native-toaster'
import { compose } from 'recompose'
import * as Yup from 'yup'
import _ from 'lodash'

import request from 'api/request'

import Error from 'components/Form/Error'
import FormInput from 'components/Form/Input'

import flexbox from 'styles/flexbox'

import { CONFIG_KEYS } from 'constants'
import SCREENS from 'constants/screens'

const Input = compose(
  handleTextInput,
  makeInputGreatAgain,
  withNextInputAutoFocusInput
)(FormInput)
const Form = withNextInputAutoFocusForm(View)

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

const validationSchema = Yup.object().shape({
  email: Yup.string().required(),
  password: Yup.string().required(),
})

const REGISTRATION_TEXT = "Don't have an account?"

type Props = {
  navigation: { [any]: any },
}

type State = {
  loading: boolean,
  showPassword: boolean,
  toasterMessage: ?ToasterMessage,
}

type ToasterMessage = {
  text: string,
  styles: $Values<ToastStyles>,
}

type FormData = {
  email: string,
  password: string,
}

class Login extends React.Component<Props, State> {
  state = {
    loading: false,
    showPassword: false,
    toasterMessage: null,
  }

  static navigationOptions = {
    title: 'Login',
  }

  navigate(key: $Values<SCREENS>) {
    const {
      navigation: { navigate },
    } = this.props // eslint-disable-line react/prop-types
    navigate({ key, routeName: key })
  }

  handleRegistrationPress = () => {
    this.navigate(SCREENS.REGISTRATION)
  }

  handleSubmit = async (values: FormData) => {
    this.setState({ loading: true })
    let res
    try {
      res = await request.post('users/login', values)
      const token = _.get(res, 'data.data.token')
      if (res && res.status === 200 && token) {
        await SecureStore.setItemAsync(CONFIG_KEYS.AUTH_TOKEN, token)
        this.navigate(SCREENS.MAIN)
      } else if (!res || res.status === 401) {
        this.setState({
          toasterMessage: {
            text: 'Login failed. Please try again.',
            styles: ToastStyles.error,
          },
        })
      }
    } catch (e) {
      this.setState({
        toasterMessage: {
          text: `An error occurred during authentication: ${e}`,
          styles: ToastStyles.error,
        },
      })
    }

    this.setState({ loading: false })
  }

  render() {
    const { showPassword, toasterMessage } = this.state

    console.log('toasterMessage', toasterMessage)

    return (
      <View style={flexbox.center}>
        <Toaster message={toasterMessage} style />
        <View style={registrationLinkStyle}>
          <Text>{REGISTRATION_TEXT}</Text>
          <Button onPress={this.handleRegistrationPress} title="Register" />
        </View>
        <View style={formWrapperStyle}>
          <Formik
            onSubmit={this.handleSubmit}
            validationSchema={validationSchema}
            render={props => {
              const didSubmit = props.submitCount > 0
              const formProps = {
                errors: {
                  email: _.get(props, 'errors.email'),
                  password: _.get(props, 'errors.password'),
                },
                touched: {
                  email: _.get(props, 'touched.email'),
                  password: _.get(props, 'touched.password'),
                },
              }

              return (
                <Form>
                  <Input
                    autoFocus
                    label="Email"
                    name="email"
                    placeholder="email"
                    type="email"
                  />
                  <Error
                    error={formProps.errors.email}
                    visible={
                      (formProps.touched.email || didSubmit) && props.dirty
                    }
                  />
                  <Input
                    label="Password"
                    name="password"
                    placeholder="password"
                    secureTextEntry={!showPassword}
                    type="password"
                  />
                  <Error
                    error={formProps.errors.password}
                    visible={
                      (formProps.touched.password || didSubmit) && props.dirty
                    }
                  />
                  <Button
                    onPress={props.handleSubmit}
                    title="Sign In"
                    type="submit"
                  />
                </Form>
              )
            }}
          />
        </View>
      </View>
    )
  }
}

export default Login

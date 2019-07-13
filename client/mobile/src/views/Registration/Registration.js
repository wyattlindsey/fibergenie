// @flow

import React from 'react'
import { Button, Text, View } from 'react-native'
import { Formik } from 'formik'
import makeInputGreatAgain, {
  handleTextInput,
  withNextInputAutoFocusForm,
  withNextInputAutoFocusInput,
} from 'react-native-formik'
import Toaster, { ToastStyles } from 'react-native-toaster'
import { SecureStore } from 'expo'
import { compose } from 'recompose'
import * as Yup from 'yup'
import _ from 'lodash'

import request from 'api/request'

import Error from 'components/Form/Error'
import FormInput from 'components/Form/Input'

import flexbox from 'styles/flexbox'

import SCREENS from 'constants/screens'
import { CONFIG_KEYS } from 'constants'

const Input = compose(
  handleTextInput,
  makeInputGreatAgain,
  withNextInputAutoFocusInput
)(FormInput)
const Form = withNextInputAutoFocusForm(View)

const formWrapperStyle = {
  maxWidth: 400,
  width: '80%',
}

const loginLinkStyle = {
  marginBottom: 32,
}

const emailAvailable = async email => {
  try {
    const res = await request.post('/users/check', { email })
    const message = _.get(res, 'data.status', 'failure')
    return message === 'success'
  } catch (e) {
    console.error('Error checking email availability: ', e)
  }
  return true
}

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required(),
  lastName: Yup.string().required(),
  email: Yup.string()
    .required()
    .email('Please enter a valid email address')
    .test('Email available', 'Email in use', emailAvailable),
  password: Yup.string()
    .required()
    .min(8, 'Please choose a password at least 8 characters long'),
})

const LOGIN_TEXT = 'Already have an account?'

type ToasterMessage = {
  text: string,
  styles: $Values<ToastStyles>,
}

type State = {
  error: string | null,
  loading: boolean,
  showPassword: boolean,
  toasterMessage: ?ToasterMessage,
}

type FormData = {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
}

class Registration extends React.Component<void, State> {
  state = {
    error: null,
    loading: false,
    showPassword: false,
  }

  static navigationOptions = {
    title: 'Registration',
  }

  navigate(key: $Values<SCREENS>) {
    const {
      navigation: { navigate },
    } = this.props // eslint-disable-line react/prop-types
    navigate({ key, routeName: key })
  }

  handleLoginPress = () => {
    this.navigate(SCREENS.LOGIN)
  }

  async authenticate(email: string, password: string) {
    this.setState({ loading: true })
    let res
    try {
      res = await request.post('users/login', { email, password })
      const token = _.get(res, 'data.data.token')
      if (res.status === 200 && token) {
        await SecureStore.setItemAsync(CONFIG_KEYS.AUTH_TOKEN, token)
        setTimeout(() => {
          this.navigate(SCREENS.MAIN)
        }, 250)
      }
    } catch (e) {
      if (res.status === 401) {
        this.setState({
          toasterMessage: {
            text: 'Login failed. Please try again.',
            styles: ToastStyles.error,
          },
        })
      } else {
        this.setState({
          toasterMessage: {
            text: `An error occurred during authentication: ${e}`,
            styles: ToastStyles.error,
          },
        })
      }
    }
    this.setState({ loading: false })
  }

  handleSubmit = async (values: FormData) => {
    this.setState({ loading: true })
    const res = await request.post('users/register', values)
    if (res.status === 201) {
      await this.authenticate(values.email, values.password)
    } else {
      this.setState({
        toasterMessage: {
          text: `Account creation failed. ${_.get(res, 'data.message', '')}`,
          styles: ToastStyles.error,
        },
      })
    }
    this.setState({ loading: false })
  }

  render() {
    const { showPassword } = this.state

    return (
      <View style={flexbox.center}>
        <View style={loginLinkStyle}>
          <Text>{LOGIN_TEXT}</Text>
          <Button onPress={this.handleLoginPress} title="Sign In" />
        </View>
        <View style={formWrapperStyle}>
          <Formik
            onSubmit={this.handleSubmit}
            validationSchema={validationSchema}
            render={props => {
              const didSubmit = props.submitCount > 0
              const formProps = {
                errors: {
                  firstName: _.get(props, 'errors.firstName'),
                  lastName: _.get(props, 'errors.lastName'),
                  email: _.get(props, 'errors.email'),
                  password: _.get(props, 'errors.password'),
                },
                touched: {
                  firstName: _.get(props, 'touched.firstName'),
                  lastName: _.get(props, 'touched.lastName'),
                  email: _.get(props, 'touched.email'),
                  password: _.get(props, 'touched.password'),
                },
              }

              return (
                <Form>
                  <Input
                    autoFocus
                    label="First name"
                    name="firstName"
                    placeholder="first name"
                    type="text"
                  />
                  <Error
                    error={formProps.errors.firstName}
                    visible={
                      (formProps.touched.firstName || didSubmit) && props.dirty
                    }
                  />
                  <Input
                    label="Last name"
                    name="lastName"
                    placeholder="last name"
                    type="text"
                  />
                  <Error
                    error={formProps.errors.lastName}
                    visible={
                      (formProps.touched.lastName || didSubmit) && props.dirty
                    }
                  />
                  <Input
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
                    title="Create Account"
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

export default Registration

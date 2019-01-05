// @flow

import React from 'react'
import { Button, Text, TextInput, View } from 'react-native'
import { Formik } from 'formik'
import makeInputGreatAgain, {
  handleTextInput,
  withNextInputAutoFocusForm,
  withNextInputAutoFocusInput,
} from 'react-native-formik'
import { compose } from 'recompose'
import * as Yup from 'yup'
import _ from 'lodash'

import Error from 'components/Form/Error'
import FormInput from 'components/Form/Input'

import flexbox from 'styles/flexbox'

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
  showPassword: boolean,
}

class Login extends React.Component<Props, State> {
  state = {
    showPassword: false,
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
    const { showPassword } = this.state

    return (
      <View style={flexbox.center}>
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

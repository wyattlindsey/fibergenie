// @flow

import React from 'react'
import { Button, View } from 'react-native'
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

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required()
    .email('Please enter a valid email address'),
  password: Yup.string()
    .required()
    .min(8, 'Please choose a password at least 8 characters long'),
})

type State = {
  showPassword: boolean,
}

class Registration extends React.Component<void, State> {
  state = {
    showPassword: false,
  }

  static navigationOptions = {
    title: 'Registration',
  }

  handleSubmit = (values: { [string]: any }) => {}

  render() {
    const { showPassword } = this.state

    return (
      <View style={flexbox.center}>
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
                    visible={formProps.touched.email || didSubmit}
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
                    visible={formProps.touched.password || didSubmit}
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

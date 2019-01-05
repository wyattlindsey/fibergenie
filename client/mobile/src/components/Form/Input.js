// @flow

import React from 'react'
import { TextInput } from 'react-native'

const textInputStyle = {
  backgroundColor: 'white',
  height: 40,
  width: '100%',
  padding: 8,
  fontSize: 16,
  borderColor: 'gray',
  borderRadius: 4,
  borderWidth: 1,
}

type Props = {
  ...TextInput.propTypes,
}

class Input extends React.Component<Props> {
  render() {
    return <TextInput style={textInputStyle} {...this.props} />
  }
}

export default Input

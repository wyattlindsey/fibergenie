// @flow

import React from 'react'
import { Text, View } from 'react-native'

const ErrorWrapperStyle = {
  height: 16,
  marginVertical: 8,
}

const ErrorTextStyle = {
  color: 'red',
  fontSize: 12,
}

type Props = {
  error?: string,
  visible?: boolean,
}

const Error = (props: Props) => {
  const { error, visible } = props
  return (
    <View style={ErrorWrapperStyle}>
      {error && visible && <Text style={ErrorTextStyle}>{error}</Text>}
    </View>
  )
}

Error.defaultProps = {
  error: '',
  visible: false,
}

export default Error

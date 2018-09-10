import React from 'react'
import { Text, View } from 'react-native'
import Styles from './styles'

export default class Chart extends React.Component {
  render() {
    return (
      <View style={Styles.center}>
        <Text>Hello Chart!</Text>
      </View>
    )
  }
}

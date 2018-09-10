import React from 'react'
import { View } from 'react-native'
import Chart from 'views/Chart'
import Styles from './styles'

export default class App extends React.Component {
  render() {
    return (
      <View style={Styles.appContainer}>
        <Chart />
      </View>
    )
  }
}

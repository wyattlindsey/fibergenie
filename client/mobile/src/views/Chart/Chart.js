import React from 'react'
import { Text, View } from 'react-native'

import flexbox from 'styles/flexbox'

class Chart extends React.Component {
  static navigationOptions = {
    title: 'Chart',
  }

  render() {
    return (
      <View style={flexbox.center}>
        <Text>Chart</Text>
      </View>
    )
  }
}

export default Chart

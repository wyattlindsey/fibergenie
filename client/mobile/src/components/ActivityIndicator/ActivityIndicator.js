// @flow
import React from 'react'
import { ActivityIndicator as RNActivityIndicator, View } from 'react-native'

import FlexBoxStyles from 'styles/flexbox'
import LayoutStyles from 'styles/layout'

class ActivityIndicator extends React.Component<*> {
  render() {
    return (
      <View style={LayoutStyles.fullHeight}>
        <RNActivityIndicator size="large" style={FlexBoxStyles.center} />
      </View>
    )
  }
}

export default ActivityIndicator

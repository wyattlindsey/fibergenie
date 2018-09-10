import React from 'react'
import { Button, Text, View } from 'react-native'

import flexbox from 'styles/flexbox'

import SCREENS from 'constants/screens'

const BUTTONS = [
  {
    id: SCREENS.CAMERA_ROLL,
    displayName: 'Photo Library',
    target: SCREENS.CAMERA_ROLL,
  },
  {
    id: SCREENS.UPLOAD,
    displayName: 'Upload',
    target: SCREENS.UPLOAD,
  },
]

class Main extends React.Component {
  static navigationOptions = {
    title: 'Home',
  }

  handleButtonPress = target => () => {
    navigate(SCREENS[target])
  }

  render() {
    const { navigate } = this.props.navigation

    return (
      <View style={flexbox.center}>
        {BUTTONS.map(({ id, displayName, target }) => (
          <Button
            key={id}
            onPress={this.handleButtonPress(target)}
            title={displayName}
          />
        ))}
      </View>
    )
  }
}

export default Main

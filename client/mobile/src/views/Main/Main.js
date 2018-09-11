import React from 'react'
import { Button, View } from 'react-native'

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
    const { navigation: { navigate } } = this.props
    navigate(SCREENS[target])
  }

  render() {
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

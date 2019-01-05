// @flow

import React from 'react'
import { Button, View } from 'react-native'

import flexbox from 'styles/flexbox'

import SCREENS from 'constants/screens'

type ButtonData = {
  id: $Values<typeof SCREENS>,
  displayName: string,
  target: $Values<typeof SCREENS>,
}

const BUTTONS: ButtonData[] = [
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

type Props = {
  navigation: { [any]: any },
}

class Main extends React.Component<Props> {
  static navigationOptions = {
    title: 'Home',
  }

  componentDidMount() {
    const { navigation: { navigate } } = this.props // eslint-disable-line react/prop-types
    navigate({ key: SCREENS.REGISTRATION, routeName: SCREENS.REGISTRATION })
  }

  handleButtonPress = (target: $Values<typeof SCREENS>) => (): void => {
    const { navigation: { navigate } } = this.props // eslint-disable-line react/prop-types
    navigate({ key: SCREENS[target], routeName: SCREENS[target] })
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

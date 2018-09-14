// @flow

import React from 'react'
import { View } from 'react-native'
import { createStackNavigator } from 'react-navigation'

import CameraRoll from 'views/CameraRoll'
import Chart from 'views/Chart'
import Login from 'views/Login'
import Main from 'views/Main'
import Registration from 'views/Registration'
import SingleImage from 'views/SingleImage'
import Upload from 'views/Upload'

import LayoutStyles from 'styles/layout'

import SCREENS from 'constants/screens'

const Screens = createStackNavigator(
  {
    [SCREENS.CAMERA_ROLL]: { screen: CameraRoll },
    [SCREENS.CHART]: { screen: Chart },
    [SCREENS.LOGIN]: { screen: Login },
    [SCREENS.MAIN]: { screen: Main },
    [SCREENS.REGISTRATION]: { screen: Registration },
    [SCREENS.SINGLE_IMAGE]: { screen: SingleImage },
    [SCREENS.UPLOAD]: { screen: Upload },
  },
  {
    initialRouteName: SCREENS.MAIN,
  }
)

class App extends React.Component <*> {
  render() {
    return (
      <View style={LayoutStyles.fullHeight}>
        <Screens />
      </View>
    )
  }
}

export default App

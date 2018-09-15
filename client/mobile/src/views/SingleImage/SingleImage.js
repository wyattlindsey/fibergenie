// @flow
import React from 'react'
import { Button, Image, Text, View } from 'react-native'
import Axios from 'axios'
import { NavigationActions, StackActions } from 'react-navigation'

import cuid from 'cuid'
import dotProp from 'dot-prop'

import ActivityIndicator from 'components/ActivityIndicator'

import Dimensions from 'constants/dimensions'
import SCREENS from 'constants/screens'

import type { CameraImage } from 'types/image'
import type { ChartData } from 'types/chart'

type Props = {
  navigation: { [string]: any },
}

type State = {
  loading: boolean,
}

class SingleImage extends React.Component<Props, State> {
  state = {
    loading: false,
  }

  handleAddButtonPress = (image: Props) => async (): Promise<void> => {
    const { node: { image: { filename: name, uri } } } = image

    const formData = new FormData()

    formData.append('chart', {
      filename: cuid(),
      name,
      uri,
    })

    this.setState({ loading: true })

    try {
      const response = await Axios.post(
        'http://localhost:3000/image',
        formData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      this.setState({ loading: false })

      const chartData: ChartData = dotProp.get(response, 'data.0')

      if (!chartData) return // todo notification

      this.navigateToChart(chartData)
    } catch (e) {
      // todo notification system
      console.error(e)
      this.setState({ loading: false })
    }
  }

  navigateToChart(chartData: ChartData): void {
    const { navigation } = this.props // eslint-disable-line react/prop-types
    navigation.dispatch(
      StackActions.replace({
        action: NavigationActions.navigate({ navigateTo: SCREENS.CHART }),
        key: SCREENS.CAMERA_ROLL,
        routeName: SCREENS.CHART,
      })
    )
    // navigation.navigate({
    //   key: SCREENS.CHART,
    //   params: { chartData },
    //   routeName: SCREENS.CHART,
    // })
  }

  render() {
    const { navigation } = this.props
    const { loading } = this.state
    const image: CameraImage = navigation.getParam('image')
    const originalWidth = dotProp.get(image, 'node.image.width')
    const originalHeight = dotProp.get(image, 'node.image.height')
    const uri = dotProp.get(image, 'node.image.uri')

    if (!image || !originalWidth || !originalHeight || !uri) return null

    const aspectRatio = originalWidth / originalHeight

    const width = Dimensions.window.fullWidth
    const height = width / aspectRatio
    const style = {
      height,
      width,
    }

    const source = { uri }

    return (
      <View>
        <Button
          disabled={loading}
          title="Add to library"
          onPress={this.handleAddButtonPress(image)}
        />
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Image source={source} style={style} />
        )}
      </View>
    )
  }
}

export default SingleImage

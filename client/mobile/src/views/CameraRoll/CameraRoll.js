// @flow
import React from 'react'
import {
  CameraRoll as ReactNativeCameraRoll,
  Image,
  ScrollView,
  TouchableHighlight,
  View,
} from 'react-native'

import dotProp from 'dot-prop'

import ActivityIndicator from 'components/ActivityIndicator'
import Dimensions from 'constants/dimensions'
import SCREENS from 'constants/screens'

import type { CameraImage } from 'types/image'

type Props = {
  navigation: { [any]: any },
}

type State = {
  loading: boolean,
  photos: CameraImage[],
}

class CameraRoll extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Photo Library',
  }

  state = {
    loading: false,
    photos: [],
  }

  async componentDidMount() {
    this.setState({ loading: true })
    try {
      const photos = await ReactNativeCameraRoll.getPhotos({
        assetType: 'Photos',
        first: 100,
      })

      this.setState({ loading: false, photos: photos.edges })
    } catch (e) {
      this.setState({ loading: false })
      console.error('Error loading images: ', e)
    }
  }

  handleImagePress = (image: CameraImage) => (): void => {
    const { navigation: { navigate } } = this.props // eslint-disable-line react/prop-types
    navigate(SCREENS.SINGLE_IMAGE, { image })
  }

  render() {
    const { loading, photos } = this.state

    return (
      <View>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <ScrollView>
            {photos.map(p => {
              const image = dotProp.get(p, 'node.image')
              const uri = dotProp.get(image, 'uri')
              const originalWidth = dotProp.get(image, 'width')
              const originalHeight = dotProp.get(image, 'height')

              if (!image || !uri || !originalWidth || !originalHeight)
                return null

              const aspectRatio = originalWidth / originalHeight

              const width = Dimensions.window.fullWidth
              const height = width / aspectRatio
              const style = {
                height,
                width,
              }

              const source = { uri }

              return (
                <TouchableHighlight
                  key={uri}
                  onPress={this.handleImagePress(p)}
                >
                  <Image source={source} style={style} />
                </TouchableHighlight>
              )
            })}
          </ScrollView>
        )}
      </View>
    )
  }
}

export default CameraRoll

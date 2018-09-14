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
import SCREENS from 'constants/screens'

type Props = {
  navigation: { [any]: any },
}

type State = {
  loading: boolean,
  photos: any[], // todo
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

  handleImagePress = (image: { [string]: any }) => (): void => {
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
              const image = dotProp.get(p, 'node.image', {})
              const uri = dotProp.get(image, 'uri', '')
              const source = { uri }
              return (
                <TouchableHighlight
                  key={uri}
                  onPress={this.handleImagePress(image)}
                >
                  <Image
                    source={source}
                    style={{
                      width: 300,
                      minHeight: 100,
                      flexShrink: 0,
                    }}
                  />
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

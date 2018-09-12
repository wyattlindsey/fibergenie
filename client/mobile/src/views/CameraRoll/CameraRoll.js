// @flow

import React from 'react'
import {
  CameraRoll as ReactNativeCameraRoll,
  Image,
  ScrollView,
  View,
} from 'react-native'

import dotProp from 'dot-prop'

type State = {
  loading: boolean,
  photos: any[], // todo
}

class CameraRoll extends React.Component<*, State> {
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

  render() {
    const { loading, photos } = this.state

    return (
      <View>
        <ScrollView>
          {photos.map(p => {
            const uri = dotProp.get(p, 'node.image.uri')
            const source = {
              uri,
            }
            return (
              <Image
                key={uri}
                source={source}
                style={{
                  width: 300,
                  minHeight: 100,
                  flexShrink: 0,
                }}
              />
            )
          })}
        </ScrollView>
      </View>
    )
  }
}

export default CameraRoll

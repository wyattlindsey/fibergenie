// @flow
import React from 'react'
import { Button, Image, Text, View } from 'react-native'

import dotProp from 'dot-prop'

import Dimensions from 'constants/dimensions'

import type { CameraImage } from 'types/image'

type Props = {
  navigation: { [string]: any },
}

class SingleImage extends React.Component<Props> {
  handleAddButtonPress = (image: Props) => (): Promise<void> => {
    console.log('press: ', image)
  }

  render() {
    const { navigation } = this.props
    const image: CameraImage = navigation.getParam('image')
    const originalWidth = dotProp.get(image, 'width')
    const originalHeight = dotProp.get(image, 'height')
    const uri = dotProp.get(image, 'uri')

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
        <Button title="Add to library" onPress={this.handleAddButtonPress(image)} />
        <Image source={source} style={style} />
      </View>
    )
  }
}

export default SingleImage

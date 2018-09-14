// @flow
import React from 'react'
import { Image, Text, View } from 'react-native'

import dotProp from 'dot-prop'

import Dimensions from 'constants/dimensions'

class SingleImage extends React.Component<*> {
  render() {
    const { navigation } = this.props
    const image = navigation.getParam('image')
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
        <Image source={source} style={style} />
      </View>
    )
  }
}

export default SingleImage

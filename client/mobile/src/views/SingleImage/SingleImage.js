// @flow
import React from 'react'
import { Button, Image, Text, View } from 'react-native'

import cuid from 'cuid'
import dotProp from 'dot-prop'

import Dimensions from 'constants/dimensions'

import type { CameraImage } from 'types/image'

type Props = {
  navigation: { [string]: any },
}

class SingleImage extends React.Component<Props> {
  handleAddButtonPress = (image: Props) => async (): Promise<void> => {
    try {
      console.log('image', image)
      const { node: { image: { filename: name, uri } } } = image

      const formData = new FormData()

      formData.append('chart', {
        uri,
        name: 'foobar',
        filename: cuid(),
        type: 'image/jpeg', // todo other types
      })

      const { res, err } = await fetch('http://localhost:3000/image', {
        method: 'POST',
        header: {
          Accept: 'application/json',
          'content-type': 'multipart/form-data',
        },
        body: formData,
      })
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    const { navigation } = this.props
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
          title="Add to library"
          onPress={this.handleAddButtonPress(image)}
        />
        <Image source={source} style={style} />
      </View>
    )
  }
}

export default SingleImage

// @flow
import React from 'react'
import { Button, Image, Text, View } from 'react-native'

import cuid from 'cuid'
import dotProp from 'dot-prop'

import Dimensions from 'constants/dimensions'

import ActivityIndicator from 'components/ActivityIndicator'

import type { CameraImage } from 'types/image'

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
      const response = await fetch('http://localhost:3000/image', {
        method: 'POST',
        header: {
          Accept: 'application/json',
          'content-type': 'multipart/form-data',
        },
        body: formData,
      })
      console.log(response)
      this.setState({ loading: false })
    } catch (e) {
      console.error(e)
      this.setState({ loading: false })
    }
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

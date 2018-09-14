// @flow
import React from 'react'
import { Image, Text, View } from 'react-native'

class SingleImage extends React.Component<*> {
  render() {
    const { navigation } = this.props
    const image = navigation.getParam('image')
    if (!image) return null
    console.log(image)
    return (
      <View>
        <Text>Single Image</Text>
      </View>
    )
  }
}

export default SingleImage

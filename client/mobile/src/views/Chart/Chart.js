// @flow
import React from 'react'
import { Image, ScrollView, Text, View } from 'react-native'

import dotProp from 'dot-prop'

import RowOutline from 'components/RowOutline'

import flexbox from 'styles/flexbox'

import dimensions from 'constants/dimensions'

import type { CameraImage } from 'types/image'
import type { ChartData } from 'types/chart'

const CHART_FOCUS_OFFSET = 5

type Props = {
  navigation: { [string]: any },
}

class Chart extends React.Component<Props> {
  static navigationOptions = {
    title: 'Chart',
  }

  componentDidMount() {
    const { p1, p2 } = this.chartData.boundingBox

    const minX = Math.min(p1.x, p2.x)
    const minY = Math.min(p1.y, p2.y)

    this.ScrollView.scrollTo({ x: minX, y: minY })
  }

  get image(): CameraImage {
    const { navigation } = this.props
    return navigation.getParam('image')
  }

  get chartData() {
    const { navigation } = this.props
    return navigation.getParam('chartData')
  }

  render() {
    const image = dotProp.get(this.image, 'node.image')
    if (!image) return null

    const source = { uri: image.uri }

    const style = {
      width: dotProp.get(image, 'width', dimensions.window.fullWidth),
      height: dotProp.get(image, 'height', dimensions.window.fullHeight),
    }

    const contentContainerStyle = {
      // overflow: 'visible',
    }

    return (
      <View>
        <ScrollView
          centerContent
          concontentContainerStyle={contentContainerStyle}
          maximumZoomScale={5}
          minimumZoomScale={0.5}
          ref={c => (this.ScrollView = c)}
        >
          <Image source={source} style={style} />
          <RowOutline chartData={this.chartData} image={image} rowIndex={0} />
        </ScrollView>
      </View>
    )
  }
}

export default Chart

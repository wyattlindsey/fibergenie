// @flow
import React from 'react'
import { Image, ScrollView, Text, View } from 'react-native'

import dotProp from 'dot-prop'

import RowOutline from 'components/RowOutline'

import flexbox from 'styles/flexbox'
import styles from './styles'

import dimensions from 'constants/dimensions'

import type { CameraImage } from 'types/image'
import type { ChartData, RowPositions } from 'types/chart'

const CHART_FOCUS_OFFSET = 5

type Props = {
  navigation: { [string]: any },
}

type State = {
  currentRowIndex: number,
  rowPositions: RowPositions,
}

class Chart extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Chart',
  }

  _scrollView: React.Node

  state = {
    // 0 (first) row is really chartData.rowPositions[n - 1] (aka bottom) so list is reversed when component mounts
    currentRowIndex: 0,
    rowPositions: [],
  }

  componentDidMount() {
    const { p1, p2 } = this.chartData.boundingBox

    const minX = Math.min(p1.x, p2.x)
    const minY = Math.min(p1.y, p2.y)

    this._scrollView.scrollTo({ x: minX, y: minY })
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

    return (
      <View>
        <View style={styles.toolbar}>
          <Text style={styles.rowText}>{`Row: ${this.state.currentRowIndex +
            1}`}</Text>
        </View>
        <ScrollView
          centerContent
          maximumZoomScale={5}
          minimumZoomScale={0.5}
          ref={c => (this._scrollView = c)}
        >
          <Image source={source} style={style} />
          <RowOutline chartData={this.chartData} image={image} rowIndex={0} />
        </ScrollView>
      </View>
    )
  }
}

export default Chart

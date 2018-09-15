// @flow
import React from 'react'
import { Button, Image, ScrollView, Text, View } from 'react-native'

import dotProp from 'dot-prop'

import RowOutline from 'components/RowOutline'

import colors from 'constants/colors'
import dimensions from 'constants/dimensions'

import type { CameraImage } from 'types/image'
import type { BoundingBox, ChartData, RowPositions } from 'types/chart'

import styles from './styles'

const moveDirections = {
  DOWN: 'DOWN',
  UP: 'UP',
}

type MoveDirection = $Values<typeof moveDirections>

type Props = {
  navigation: { [string]: any },
}

type State = {
  boundingBox: BoundingBox,
  currentRowIndex: number,
  rowPositions: RowPositions,
}

class Chart extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Chart',
  }

  state = {
    // 0 (first) row is really chartData.rowPositions[n - 1] (aka bottom)
    // so list is reversed when component mounts
    boundingBox: null,
    currentRowIndex: 0,
    rowPositions: [],
  }

  scrollView: any

  componentDidMount() {
    const image = dotProp.get(this.image, 'node.image')

    const { fullWidth: viewPortWidth } = dimensions.window

    const imageWidth = dotProp.get(image, 'width', viewPortWidth)

    const scaleRatio = viewPortWidth / imageWidth

    const rowPositions: RowPositions = [...this.chartData.rowPositions].map(p =>
      Math.ceil(p * scaleRatio)
    )

    const scaledBoundingBox: BoundingBox = {
      p1: {
        x: Math.ceil(this.chartData.boundingBox.p1.x * scaleRatio),
        y: Math.ceil(this.chartData.boundingBox.p1.y * scaleRatio),
      },
      p2: {
        x: Math.ceil(this.chartData.boundingBox.p2.x * scaleRatio),
        y: Math.ceil(this.chartData.boundingBox.p2.y * scaleRatio),
      },
    }
    this.setState({
      boundingBox: scaledBoundingBox,
      rowPositions,
    })
  }

  get image(): CameraImage {
    const { navigation } = this.props
    return navigation.getParam('image')
  }

  get chartData(): ChartData {
    const { navigation } = this.props
    return navigation.getParam('chartData')
  }

  get toolBar() {
    const { currentRowIndex, rowPositions } = this.state

    return (
      <View style={styles.toolbar}>
        <Text style={styles.rowText}>{`Row: ${currentRowIndex + 1}`}</Text>
        <View style={styles.buttonGroup}>
          <Button
            color={colors.blue}
            disabled={currentRowIndex >= rowPositions.length - 2}
            onPress={this.handleButtonPress(moveDirections.UP)}
            style={styles.arrowButton}
            title="↑"
          />
          <Button
            color={colors.blue}
            disabled={currentRowIndex === 0}
            onPress={this.handleButtonPress(moveDirections.DOWN)}
            style={styles.arrowButton}
            title="↓"
          />
        </View>
      </View>
    )
  }

  handleButtonPress = (direction: MoveDirection) => (): void => {
    if (direction === moveDirections.UP) {
      this.setState(state => {
        return {
          ...state,
          currentRowIndex:
            state.currentRowIndex >= state.rowPositions.length - 1
              ? state.currentRowIndex
              : state.currentRowIndex + 1,
        }
      })
    } else if (direction === moveDirections.DOWN) {
      this.setState(state => {
        return {
          ...state,
          currentRowIndex:
            state.currentRowIndex === 0 ? 0 : state.currentRowIndex - 1,
        }
      })
    }
  }

  render() {
    const { boundingBox, currentRowIndex, rowPositions } = this.state

    const image = dotProp.get(this.image, 'node.image')
    if (!image) return null

    const source = { uri: image.uri }

    const { fullWidth: viewPortWidth } = dimensions.window
    const { fullHeight: viewPortHeight } = dimensions.window

    const imageWidth = dotProp.get(image, 'width', viewPortWidth)
    const imageHeight = dotProp.get(image, 'height', viewPortHeight)
    const aspectRatio = imageWidth / imageHeight

    const style = {
      width: viewPortWidth,
      height: viewPortWidth / aspectRatio,
    }

    const scaledChartData = {
      boundingBox,
      rowPositions,
    }

    return (
      <View>
        {this.toolBar}

        <ScrollView
          centerContent
          maximumZoomScale={5}
          minimumZoomScale={0.5}
          ref={c => {
            this.scrollView = c
          }}
        >
          <Image source={source} style={style} />
          {boundingBox && (
            <RowOutline
              chartData={scaledChartData}
              currentRowIndex={currentRowIndex}
              image={image}
            />
          )}
        </ScrollView>
      </View>
    )
  }
}

export default Chart

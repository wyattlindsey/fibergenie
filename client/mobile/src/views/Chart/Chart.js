// @flow
import React from 'react'
import { Button, Image, ScrollView, Text, View } from 'react-native'

import dotProp from 'dot-prop'

import RowOutline from 'components/RowOutline'

import colors from 'constants/colors'
import dimensions from 'constants/dimensions'

import type { CameraImage } from 'types/image'
import type { ChartData, RowPositions } from 'types/chart'

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
    currentRowIndex: 0,
    rowPositions: [],
  }

  scrollView: any

  componentDidMount() {
    const rowPositions: RowPositions = [...this.chartData.rowPositions]
    rowPositions.pop() // remove the last item in rowPositions because
    // it's the top line of rowPosition[n - 1]
    this.setState({ rowPositions })

    const { p1, p2 } = this.chartData.boundingBox

    const minX = Math.min(p1.x, p2.x)
    const minY = Math.min(p1.y, p2.y)

    this.scrollView.scrollTo({ x: minX, y: minY })
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
            disabled={currentRowIndex >= rowPositions.length - 1}
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
    const { currentRowIndex } = this.state

    const image = dotProp.get(this.image, 'node.image')
    if (!image) return null

    const source = { uri: image.uri }

    const style = {
      width: dotProp.get(image, 'width', dimensions.window.fullWidth),
      height: dotProp.get(image, 'height', dimensions.window.fullHeight),
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
          <RowOutline
            chartData={this.chartData}
            currentRowIndex={currentRowIndex}
            image={image}
          />
        </ScrollView>
      </View>
    )
  }
}

export default Chart

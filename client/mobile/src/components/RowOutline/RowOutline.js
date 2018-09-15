// @flow
import React from 'react'
import { View } from 'react-native'

import type { ChartData, Coord, RowPositions } from 'types/chart'
import type { CameraImage } from 'types/image'

type Props = {
  chartData: ChartData,
  image: CameraImage,
  rowIndex: number,
}

type State = {
  currentIndex: number,
  rowPositions: RowPositions,
}

class RowOutline extends React.Component<Props, State> {
  state = {
    currentIndex: 0,
    rowPositions: [],
  }

  componentDidMount() {
    const { chartData } = this.props
    const reversedRowPositions = [...chartData.rowPositions].reverse()

    console.log(reversedRowPositions)

    this.setState({
      rowPositions: reversedRowPositions,
    })
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const numberOfRows = prevState.rowPositions.length
    return {
      ...prevState,
      // There's an extra rowPosition returned by the service because it's counting all lines, even the closing
      // line of the last row.
      currentIndex:
        nextProps.rowIndex >= numberOfRows - 1 // todo check for off by one errors
          ? numberOfRows - 1
          : nextProps.rowIndex,
    }
  }

  get bounds() {
    const { currentIndex, rowPositions } = this.state
    const { chartData } = this.props
    const { boundingBox } = chartData
    const maxX = Math.max(boundingBox.p1.x, boundingBox.p2.x)
    const maxY = Math.max(boundingBox.p1.y, boundingBox.p2.y)
    const minX = Math.min(boundingBox.p1.x, boundingBox.p2.x)
    const minY = Math.min(boundingBox.p1.y, boundingBox.p2.y)
    const upperLeft: Coord = { x: minX, y: rowPositions[currentIndex + 1] }
    const lowerRight: Coord = { x: maxX, y: rowPositions[currentIndex] }
    return { upperLeft, lowerRight }
  }

  render() {
    const { bounds: { lowerRight, upperLeft } } = this
    const outlineStyle = {
      borderWidth: 2,
      borderColor: 'blue',
      position: 'absolute',
      left: upperLeft.x,
      top: upperLeft.y,
      height: lowerRight.y - upperLeft.y,
      width: lowerRight.x - upperLeft.x,
    }
    return <View style={outlineStyle} />
  }
}

export default RowOutline

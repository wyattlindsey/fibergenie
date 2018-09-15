// @flow
import React from 'react'
import { View } from 'react-native'

import colors from 'constants/colors'

import type { ChartData, Coord, RowPositions } from 'types/chart'

type Props = {
  chartData: ChartData,
  currentRowIndex: number,
  scaleRatio: number,
}

type State = {
  rowPositions: RowPositions,
}

class RowOutline extends React.Component<Props, State> {
  state = {
    rowPositions: [],
  }

  componentDidMount() {
    const { chartData } = this.props
    const reversedRowPositions = [...chartData.rowPositions].reverse()

    this.setState({
      rowPositions: reversedRowPositions,
    })
  }

  get bounds() {
    const { rowPositions } = this.state
    const { currentRowIndex } = this.props
    const { chartData } = this.props
    const { boundingBox } = chartData
    const maxX = Math.max(boundingBox.p1.x, boundingBox.p2.x)
    const minX = Math.min(boundingBox.p1.x, boundingBox.p2.x)

    // upper left corner needs a nudge of 1
    const upperLeft: Coord = {
      x: minX - 1,
      y: rowPositions[currentRowIndex + 1] - 1,
    }
    const lowerRight: Coord = { x: maxX, y: rowPositions[currentRowIndex] }
    return { upperLeft, lowerRight }
  }

  render() {
    const { scaleRatio } = this.props
    const { lowerRight, upperLeft } = this.bounds

    const borderWidth = Math.max(Math.floor(4 * scaleRatio), 1)

    const outlineStyle = {
      borderWidth,
      borderColor: colors.blue,
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

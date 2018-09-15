// @flow
import React from 'react'
import { View } from 'react-native'

import colors from 'constants/colors'

import type { ChartData, Coord, RowPositions } from 'types/chart'

type Props = {
  chartData: ChartData,
  currentRowIndex: number,
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
    const upperLeft: Coord = { x: minX, y: rowPositions[currentRowIndex + 1] }
    const lowerRight: Coord = { x: maxX, y: rowPositions[currentRowIndex] }
    return { upperLeft, lowerRight }
  }

  render() {
    const { bounds: { lowerRight, upperLeft } } = this
    const outlineStyle = {
      borderWidth: 2,
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

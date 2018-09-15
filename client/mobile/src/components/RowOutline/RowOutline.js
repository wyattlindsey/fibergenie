// @flow
import React from 'react'
import { View } from 'react-native'

import colors from 'constants/colors'

import type { ChartData, Coord, RowPositions } from 'types/chart'
import type { CameraImage } from 'types/image'

type Props = {
  chartData: ChartData,
  currentRowIndex: number,
  image: CameraImage,
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

    console.log(reversedRowPositions)

    this.setState({
      rowPositions: reversedRowPositions,
    })
  }

  get bounds() {
    const { rowPositions } = this.state
    const { currentRowIndex } = this.props
    console.log('currentRowIndex', currentRowIndex)
    const { chartData } = this.props
    const { boundingBox } = chartData
    const maxX = Math.max(boundingBox.p1.x, boundingBox.p2.x)
    const maxY = Math.max(boundingBox.p1.y, boundingBox.p2.y)
    const minX = Math.min(boundingBox.p1.x, boundingBox.p2.x)
    const minY = Math.min(boundingBox.p1.y, boundingBox.p2.y)
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

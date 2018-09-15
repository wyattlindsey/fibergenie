// @flow
import React from 'react'
import { View } from 'react-native'

import type { ChartData, Coord } from 'types/chart'
import type { CameraImage } from 'types/image'

type Props = {
  chartData: ChartData,
  image: CameraImage,
  rowIndex: number,
}

class RowOutline extends React.Component<Props> {
  get bounds() {
    const { chartData, image, rowIndex } = this.props
    const { boundingBox, rowPositions } = chartData
    const maxX = Math.max(boundingBox.p1.x, boundingBox.p2.x)
    const maxY = Math.max(boundingBox.p1.y, boundingBox.p2.y)
    const minX = Math.min(boundingBox.p1.x, boundingBox.p2.x)
    const minY = Math.min(boundingBox.p1.y, boundingBox.p2.y)
    const upperLeft: Coord = { x: minX, y: rowPositions[rowIndex] }
    const lowerRight: Coord = { x: maxX, y: rowPositions[rowIndex + 1] }
    return { upperLeft, lowerRight }
  }

  render() {
    console.log(this.bounds)
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

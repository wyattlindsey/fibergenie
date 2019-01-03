import { StyleSheet } from 'react-native'
import Dimensions from 'constants/dimensions'

const fullHeight = {
  height: Dimensions.window.fullHeight,
}

const fillWidth = {
  width: '100%',
}

const styles = StyleSheet.create({
  fullHeight,
  fillWidth,
})

export default styles

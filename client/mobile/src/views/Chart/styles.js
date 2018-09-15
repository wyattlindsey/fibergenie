// @flow
import { StyleSheet } from 'react-native'
import dimensions from 'constants/dimensions'

const toolbar = {
  flexDirection: 'row',
  justifyContent: 'center',
  paddingVertical: 12,
  width: dimensions.window.fullWidth,
}

const rowText = {
  color: 'blue',
  fontSize: 24,
}

const styles = StyleSheet.create({
  rowText,
  toolbar,
})

export default styles

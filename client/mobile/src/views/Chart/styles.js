// @flow
import { StyleSheet } from 'react-native'

import colors from 'constants/colors'
import dimensions from 'constants/dimensions'

const toolbar = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 12,
  width: dimensions.window.fullWidth,
}

const rowText = {
  color: colors.blue,
  fontSize: 24,
}

const buttonGroup = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  minWidth: 150,
  maxHeight: 40,
}

const arrowButton = {
  fontSize: 24,
  fontWeight: 'bold',
  padding: 8,
}

const styles = StyleSheet.create({
  arrowButton,
  buttonGroup,
  rowText,
  toolbar,
})

export default styles

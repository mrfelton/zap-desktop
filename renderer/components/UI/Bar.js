import React from 'react'
import PropTypes from 'prop-types'
import { Box } from 'rebass/styled-components'
import merge from 'lodash/merge'

const Bar = ({ sx, variant, ...rest }) => {
  return (
    <Box
      as="hr"
      {...rest}
      sx={merge(
        {
          bg: 'primaryText',
          border: 0,
          height: 1,
        },
        sx
      )}
      variant={`bar.${variant}`}
    />
  )
}

Bar.propTypes = {
  sx: PropTypes.object,
  variant: PropTypes.string,
}

Bar.defaultProps = {
  variant: 'normal',
}

export default Bar

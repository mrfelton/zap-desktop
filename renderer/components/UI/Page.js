import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from 'rebass/styled-components'
import merge from 'lodash/merge'

const Page = ({ sx, ...rest }) => {
  return (
    <Flex
      as="article"
      bg="primaryColor"
      color="primaryText"
      height="100%"
      minHeight="425px"
      minWidth="900px"
      {...rest}
      sx={merge(
        {
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'l',
        },
        sx
      )}
    />
  )
}

Page.propTypes = {
  sx: PropTypes.object,
}

export default Page

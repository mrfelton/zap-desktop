import React from 'react'
import PropTypes from 'prop-types'
import { Card as BaseCard } from 'rebass/styled-components'
import merge from 'lodash/merge'

const Card = React.forwardRef(({ sx, ...rest }, ref) => {
  return (
    <BaseCard
      ref={ref}
      as="section"
      {...rest}
      sx={merge(
        {
          borderRadius: 's',
          boxShadow: 'm',
          p: 3,
          bg: 'primaryColor',
          color: 'primaryText',
        },
        sx
      )}
    />
  )
})

Card.propTypes = {
  sx: PropTypes.object,
}

Card.displayName = 'Card'

export default Card

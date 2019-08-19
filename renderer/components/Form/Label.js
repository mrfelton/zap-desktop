import React from 'react'
import { Label as BaseLabel } from '@rebass/forms'

const Label = React.forwardRef((props, ref) => {
  return (
    <BaseLabel ref={ref} color="primaryText" fontWeight="normal" mb={1} width="auto" {...props} />
  )
})

Label.displayName = 'Card'

export default Label

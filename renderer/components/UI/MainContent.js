import React from 'react'
import { Box } from 'rebass/styled-components'

const MainContent = props => (
  <Box
    as="article"
    height="100%"
    {...props}
    css={`
      flex: 1;
    `}
    sx={{ overflowY: 'overlay', overflowX: 'hidden' }}
  />
)

export default MainContent

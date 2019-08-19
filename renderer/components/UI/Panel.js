import React from 'react'
import { Box, Flex } from 'rebass/styled-components'

const PanelHeader = props => <Box as="header" {...props} />

const PanelBody = props => (
  <Box
    as="section"
    {...props}
    css={`
      flex: 1;
    `}
  />
)

const PanelFooter = props => <Box as="footer" pt="auto" {...props} />

const Panel = props => <Flex as="article" flexDirection="column" height="100%" {...props} />

Panel.Header = PanelHeader
Panel.Body = PanelBody
Panel.Footer = PanelFooter

export default Panel
export { PanelHeader, PanelBody, PanelFooter }

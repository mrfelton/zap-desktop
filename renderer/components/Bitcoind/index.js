import React from 'react'
import PropTypes from 'prop-types'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import { tint } from 'polished'
import { Heading, Text } from 'components/UI'
import ZapLogo from 'components/Icon/ZapLogo'

const FilledBar = styled(Box)`
  background: linear-gradient(
    to bottom,
    ${props => tint(0.3, props.theme.colors.lightningOrange)},
    ${props => props.theme.colors.lightningOrange}
  );
  margin-left: ${props => (props.justify === 'right' ? 'auto' : 'none')};
  transition: all 0.25s;
  height: 100%;
`

const Bitcoind = ({ syncStatus, syncPercentage, blockHeight, bitcoindBlockHeight, ...rest }) => (
  <Flex width={1} {...rest} alignItems="center" flexDirection="column" justifyContent="center">
    <ZapLogo height={42} width={42} />
    <Heading.h1 my={2}>Syncing the blockchain</Heading.h1>
    <Text>{syncPercentage.toFixed(2)}%</Text>
    <Text>Block Height: {blockHeight}</Text>
    <Text>Sync Height: {bitcoindBlockHeight}</Text>

    <Box
      bg="lightningOrange"
      css={`
        height: ${syncPercentage}%;
        position: absolute;
        bottom: 0;
      `}
      width={1}
    >
      <FilledBar />
    </Box>
  </Flex>
)

export default Bitcoind

Bitcoind.propTypes = {
  bitcoindBlockHeight: PropTypes.number,
  blockHeight: PropTypes.number,
  syncPercentage: PropTypes.number,
  syncStatus: PropTypes.string,
}

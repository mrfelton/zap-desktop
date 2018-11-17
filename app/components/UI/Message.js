import React from 'react'
import PropTypes from 'prop-types'
import { Box, Flex, Text } from 'rebass'
import Success from 'components/Icon/Success'
import Warning from 'components/Icon/Warning'
import Error from 'components/Icon/Error'

import styled from 'styled-components'
import { variant } from 'styled-system'

const messageStyle = variant({ key: 'messages' })
const StyledMessage = styled(Flex)(messageStyle)

/**
 * @render react
 * @name Message
 * @example
 * <Message message="Error message" />
 */
class Message extends React.Component {
  static displayName = 'Message'

  static propTypes = {
    variant: PropTypes.string,
    children: PropTypes.node
  }

  renderIcon = () => {
    const { variant } = this.props
    return (
      <Box mr={1} width="14px" css={{ height: '14px' }}>
        {variant === 'success' && <Success height="14px" width="14px" />}
        {variant === 'warning' && <Warning height="14px" width="14px" />}
        {variant === 'error' && <Error height="14px" width="14px" />}
      </Box>
    )
  }

  render() {
    const { children, variant, ...rest } = this.props
    return (
      <Text fontSize="s" fontWeight="normal" {...rest}>
        <StyledMessage variant={variant} alignItems="center">
          {this.renderIcon()}
          {children}
        </StyledMessage>
      </Text>
    )
  }
}

export default Message

import React from 'react'
import PropTypes from 'prop-types'
import { Box, Flex, Text } from 'rebass/styled-components'
import Success from 'components/Icon/Success'
import Warning from 'components/Icon/Warning'
import Error from 'components/Icon/Error'
import Spinner from './Spinner'

class Message extends React.Component {
  static displayName = 'Message'

  static propTypes = {
    children: PropTypes.node,
    justifyContent: PropTypes.string,
    variant: PropTypes.string,
  }

  renderIcon = () => {
    const { variant } = this.props
    return (
      <Box mr={1} width="14px">
        {variant === 'success' && <Success height="14px" width="14px" />}
        {variant === 'warning' && <Warning height="14px" width="14px" />}
        {variant === 'error' && <Error height="14px" width="14px" />}
        {variant === 'processing' && <Spinner size="14px" />}
      </Box>
    )
  }

  render() {
    const { children, justifyContent, variant, ...rest } = this.props
    return (
      <Box fontSize="s" fontWeight="normal" variant={`message.${variant}`} {...rest}>
        <Flex alignItems="flex-start" justifyContent={justifyContent}>
          {this.renderIcon()}
          <Text lineHeight="normal">{children}</Text>
        </Flex>
      </Box>
    )
  }
}

export default Message

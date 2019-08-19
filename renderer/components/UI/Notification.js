import React from 'react'
import PropTypes from 'prop-types'
import { Box, Flex, Text } from 'rebass/styled-components'
import merge from 'lodash/merge'
import X from 'components/Icon/X'
import Success from 'components/Icon/Success'
import Warning from 'components/Icon/Warning'
import Error from 'components/Icon/Error'
import Spinner from './Spinner'

/**
 * @name Notification
 * @example
 * <Notification variant="success">Success message</Success/>
 */
class Notification extends React.Component {
  static displayName = 'Notification'

  static defaultProps = {
    variant: 'success',
  }

  static propTypes = {
    children: PropTypes.node,
    isProcessing: PropTypes.bool,
    variant: PropTypes.string,
  }

  state = { hover: false }

  hoverOn = () => {
    this.setState({ hover: true })
  }

  hoverOff = () => {
    this.setState({ hover: false })
  }

  render() {
    const { children, isProcessing, variant, ...rest } = this.props
    const { hover } = this.state
    const { sx = {} } = rest
    return (
      <Box
        onMouseEnter={this.hoverOn}
        onMouseLeave={this.hoverOff}
        {...rest}
        sx={merge(
          {
            borderRadius: 's',
            boxShadow: 's',
            cursor: 'pointer',
            px: 3,
            py: 3,
          },
          sx
        )}
        variant={`notification.${variant}`}
      >
        <Flex justifyContent="space-between">
          <Flex alignItems="center">
            <Text fontSize="xl">
              {isProcessing && <Spinner height="0.9em" width="0.9em" />}
              {!isProcessing && variant === 'success' && <Success />}
              {!isProcessing && variant === 'warning' && <Warning />}
              {!isProcessing && variant === 'error' && <Error />}
            </Text>
            <Text fontWeight="normal" ml={2}>
              {children}
            </Text>
          </Flex>
          <Text fontSize="xs" mt={1}>
            <X strokeWidth={hover ? 5 : 4} />
          </Text>
        </Flex>
      </Box>
    )
  }
}

export default Notification

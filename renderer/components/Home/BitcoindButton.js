import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Flex } from 'rebass'
import { Button, Text } from 'components/UI'
import Bitcoin from 'components/Icon/Bitcoin'
import messages from './messages'

const BitcoindButton = ({ history, ...rest }) => (
  <Button onClick={() => history.push('/bitcoind')} size="small" variant="secondary" {...rest}>
    <Flex alignItem="center">
      <Text color="lightningOrange">
        <Bitcoin height="22px" width="22px" />
      </Text>
      <Text lineHeight="22px" ml={2}>
        <FormattedMessage {...messages.bitcoind_button_text} />
      </Text>
    </Flex>
  </Button>
)
BitcoindButton.propTypes = {
  history: PropTypes.object.isRequired,
}

export default BitcoindButton

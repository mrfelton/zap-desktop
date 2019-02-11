import React from 'react'
import PropTypes from 'prop-types'
import { FormattedTime, FormattedMessage, injectIntl, intlShape } from 'react-intl'
import { Box, Flex } from 'rebass'
import { Message, Span, Text } from 'components/UI'
import { CryptoValue, FiatValue } from 'containers/UI'
import messages from './messages'

const Transaction = ({ transaction, showActivityModal, currencyName, intl }) => (
  <Flex
    justifyContent="space-between"
    alignItems="center"
    onClick={
      !transaction.sending ? () => showActivityModal('TRANSACTION', transaction.tx_hash) : null
    }
    py={2}
  >
    <Box
      width={3 / 4}
      className="hint--top-right"
      data-hint={intl.formatMessage({ ...messages.type })}
    >
      <Text mb={1}>
        <FormattedMessage {...messages[transaction.received ? 'received' : 'sent']} />
      </Text>

      {transaction.sending ? (
        <>
          {transaction.status === 'sending' && (
            <Message variant="processing">
              <FormattedMessage {...messages.status_processing} />
            </Message>
          )}
          {transaction.status === 'successful' && (
            <Message variant="success">
              <FormattedMessage {...messages.status_success} />
            </Message>
          )}
          {transaction.status === 'failed' && (
            <Message variant="error">
              <FormattedMessage {...messages.status_error} /> {transaction.error}
            </Message>
          )}
        </>
      ) : (
        <Text color="gray" fontSize="xs" fontWeight="normal">
          <FormattedTime value={transaction.time_stamp * 1000} />
        </Text>
      )}
    </Box>

    <Box
      width={1 / 4}
      className="hint--top-left"
      data-hint={intl.formatMessage({ ...messages.amount })}
    >
      <Box css={transaction.status == 'failed' ? { opacity: 0.5 } : null}>
        <Text mb={1} textAlign="right">
          {transaction.received && (
            <Span color="superGreen" fontWeight="normal" mr={1}>
              +
            </Span>
          )}
          {!transaction.received && transaction.status !== 'failed' && (
            <Span color="superRed" fontWeight="normal" mr={1}>
              -
            </Span>
          )}
          <CryptoValue value={transaction.amount} />
          <i> {currencyName}</i>
        </Text>
        <Text textAlign="right" color="gray" fontSize="xs" fontWeight="normal">
          <FiatValue value={transaction.amount} style="currency" />
        </Text>
      </Box>
    </Box>
  </Flex>
)

Transaction.propTypes = {
  intl: intlShape.isRequired,
  transaction: PropTypes.object.isRequired,
  showActivityModal: PropTypes.func.isRequired,
  currencyName: PropTypes.string.isRequired
}

export default injectIntl(Transaction)

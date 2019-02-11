import React from 'react'
import PropTypes from 'prop-types'
import { Box, Card } from 'rebass'
import { convert } from 'lib/utils/btc'
import { Bar, Button, Form, Header, Message, Panel, Span, Text } from 'components/UI'
import { CurrencyFieldGroup } from 'containers/UI'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import messages from './messages'

class SubmitChannelForm extends React.Component {
  static propTypes = {
    /** Currently selected cryptocurrency (key). */
    cryptoCurrency: PropTypes.string.isRequired,
    /** Information about existing active channel to the node we are trying to connect to. */
    dupeChanInfo: PropTypes.object,
    /** Information about the node we are trying to connect to. */
    node: PropTypes.object.isRequired,
    intl: intlShape.isRequired,

    /** Close the submit chanel form. */
    closeSubmitChannelForm: PropTypes.func.isRequired,
    /** Close the contacts form. */
    closeContactsForm: PropTypes.func.isRequired,
    /** Open a Lightning channel */
    openChannel: PropTypes.func.isRequired
  }

  onSubmit = values => {
    const {
      cryptoCurrency,
      closeSubmitChannelForm,
      closeContactsForm,
      node,
      openChannel
    } = this.props

    // Convert amount to satoshis.
    const amountInSatoshis = convert(cryptoCurrency, 'sats', values.amountCrypto)

    // submit the channel to LND
    openChannel({
      pubkey: node.pub_key,
      host: node.addresses[0].addr,
      localamt: amountInSatoshis
    })
    // close the SubmitChannelForm component
    closeSubmitChannelForm()
    // close the AddChannel component
    closeContactsForm()
  }

  /**
   * Store the formApi on the component context to make it available at this.formApi.
   */
  setFormApi = formApi => {
    this.formApi = formApi
  }

  renderWarning = dupeChanInfo => {
    const { alias, activeChannels, capacity, currencyName } = dupeChanInfo
    const aliasMsg = alias ? alias : 'this_node'

    return (
      <p>
        <FormattedMessage
          {...messages.duplicate_warnig}
          values={{
            activeChannels,
            aliasMsg
          }}
        />{' '}
        {capacity} {currencyName}.
      </p>
    )
  }

  render() {
    const {
      cryptoCurrency,
      intl,
      closeSubmitChannelForm,
      closeContactsForm,
      node,
      openChannel,
      dupeChanInfo,
      ...rest
    } = this.props
    return (
      <Form css={{ height: '100%' }} {...rest} getApi={this.setFormApi} onSubmit={this.onSubmit}>
        {({ formApi, formState }) => (
          <Panel {...rest} width={1}>
            <Panel.Header>
              <Header
                title={<FormattedMessage {...messages.title} />}
                subtitle={<FormattedMessage {...messages.description} />}
              />
              <Bar mt={2} />
            </Panel.Header>

            <Panel.Body py={3}>
              <Card borderRadius={8} bg="tertiaryColor" width={1} mb={4}>
                <Text
                  p={3}
                  fontSize="s"
                  css={{
                    overflow: 'hidden',
                    'white-space': 'nowrap',
                    'text-overflow': 'ellipsis'
                  }}
                >
                  {node.alias && node.alias.length > 0 && (
                    <Span fontWeight="normal">{node.alias}: </Span>
                  )}
                  {node.pub_key}
                </Text>
              </Card>

              {dupeChanInfo && (
                <Box my={3}>
                  <Message variant="warning">{this.renderWarning(dupeChanInfo)}</Message>
                </Box>
              )}

              <CurrencyFieldGroup formApi={formApi} />
            </Panel.Body>

            <Panel.Footer mx="auto">
              <Button
                disabled={!formState.values.amountCrypto || formState.values.amountCrypto <= 0}
              >
                <FormattedMessage {...messages.submit} />
              </Button>
            </Panel.Footer>
          </Panel>
        )}
      </Form>
    )
  }
}

export default injectIntl(SubmitChannelForm)

import React from 'react'
import PropTypes from 'prop-types'
import { Box, Flex } from 'rebass'
import { Form } from 'informed'
import SystemNavNext from 'components/Icon/SystemNavNext'
import Bar from 'components/UI/Bar'
import Button from 'components/UI/Button'
import Heading from 'components/UI/Heading'
import Input from 'components/UI/Input'
import Label from 'components/UI/Label'
import Notification from 'components/UI/Notification'
import * as yup from 'yup'

/**
 * @render react
 * @name WalletUnlocker
 * @example
 * <WalletUnlocker
     wallet={{ ... }}
     unlockWallet={() => {}}
     setError={() => {}} >
 */
export class WalletUnlocker extends React.Component {
  static displayName = 'WalletUnlocker'

  static propTypes = {
    unlockWallet: PropTypes.func.isRequired,
    wallet: PropTypes.object.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    })
  }

  constructor(props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }

  /**
   * Form submit handler.
   * @param  {Object} values submitted form values.
   */
  onSubmit(values) {
    const { history, unlockWallet, wallet } = this.props
    unlockWallet({ history, id: wallet.id, password: values.password })
  }

  /**
   * Field validator.
   */
  validatePassword(value) {
    try {
      yup
        .string()
        .required()
        .min(8)
        .validateSync(value)
    } catch (error) {
      return error.message
    }
  }

  /**
   * Form renderer.
   * @return {[type]} [description]
   */
  render() {
    const { wallet } = this.props

    if (!wallet) {
      return null
    }

    return (
      <Form
        style={{ width: '100%' }}
        onSubmit={this.onSubmit}
        onSubmitFailure={this.onSubmitFailure}
        initialValues={wallet.settings}
        key={wallet.id}
      >
        {({ formState }) => (
          <React.Fragment>
            {formState.submits > 0 &&
              formState.invalid && (
                <Notification variant="error">Please correct the errors show below.</Notification>
              )}

            <Flex py={3} alignItems="flex-start">
              <Box width={1 / 2}>
                <Heading.h1 fontSize="xxxl"> {wallet.name}</Heading.h1>
              </Box>
              <Box ml="auto">
                <Button type="submit" variant="primary">
                  Launch
                  <SystemNavNext size="1.5em" />
                </Button>
              </Box>
            </Flex>
            <Bar />
            <Flex py={3} alignItems="center">
              <Box width={1 / 2}>
                <Label htmlFor="password">Password</Label>
              </Box>
              <Box ml="auto">
                <Input
                  field="password"
                  id="password"
                  type="Password"
                  validate={this.validatePassword}
                  validateOnBlur
                  validateOnChange={formState.invalid}
                />
              </Box>
            </Flex>
          </React.Fragment>
        )}
      </Form>
    )
  }
}

export default WalletUnlocker

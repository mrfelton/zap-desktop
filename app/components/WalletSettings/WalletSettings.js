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
import Range from 'components/UI/Range'
import Toggle from 'components/UI/Toggle'
import * as yup from 'yup'

/**
 * @render react
 * @name WalletSettings
 * @example
 * <WalletSettings
     wallet={{ ... }}
     saveWalletSettings={() => {}}
     setError={() => {}} >
 */
export class WalletSettings extends React.Component {
  static displayName = 'WalletSettings'

  static propTypes = {
    saveWalletSettings: PropTypes.func.isRequired,
    wallet: PropTypes.object.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    })
  }

  constructor(props) {
    super(props)
    this.onSubmit = this.onSubmit.bind(this)
    this.setFormApi = this.setFormApi.bind(this)
  }

  /**
   * Form submit handler.
   * @param  {Object} values submitted form values.
   */
  onSubmit(values) {
    const { history, saveWalletSettings } = this.props
    saveWalletSettings({ history, values })
  }

  setFormApi(formApi) {
    this.formApi = formApi
  }

  /**
   * Field validator.
   */
  validateAutopilot(value) {
    try {
      yup.boolean().validateSync(value)
    } catch (error) {
      return error.message
    }
  }

  /**
   * Field validator.
   */
  validateAutopilotMaxChannels(value) {
    try {
      yup
        .number()
        .required()
        .positive()
        .integer()
        .max(100)
        .typeError('A number is required')
        .validateSync(value)
    } catch (error) {
      return error.message
    }
  }

  /**
   * Field validator.
   */
  validateAutopilotAllocation(value) {
    try {
      yup
        .number()
        .required()
        .positive()
        .min(0)
        .max(1)
        .typeError('A number is required')
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
        getApi={this.setFormApi}
        style={{ width: '100%' }}
        onSubmit={this.onSubmit}
        onSubmitFailure={this.onSubmitFailure}
        initialValues={wallet}
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
                <Label htmlFor="autopilot">Autopilot</Label>
              </Box>
              <Box ml="auto">
                <Toggle
                  field="autopilot"
                  id="autopilot"
                  validate={this.validateAutopilot}
                  validateOnBlur
                  validateOnChange={formState.invalid}
                />
              </Box>
            </Flex>

            {formState.values.autopilot ? (
              <React.Fragment>
                <Bar />
                <Flex py={3} alignItems="center">
                  <Box width={1 / 2}>
                    <Label htmlFor="autopilotMaxChannels">Number of Channels max.</Label>
                  </Box>
                  <Box ml="auto">
                    <Input
                      field="autopilotMaxChannels"
                      id="autopilotMaxChannels"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      validate={this.validateAutopilotMaxChannels}
                      validateOnBlur
                      validateOnChange={formState.invalid}
                      ml="auto"
                      justifyContent="flex-end"
                    />
                  </Box>
                </Flex>

                <Bar />

                <Flex py={3} alignItems="center">
                  <Box width={1 / 2}>
                    <Label htmlFor="autopilotAllocation">Percentage of Balance</Label>
                  </Box>
                  <Box ml="auto">
                    <Range
                      field="autopilotAllocation"
                      id="autopilotAllocation"
                      validate={this.validateAutopilotAllocation}
                      validateOnBlur
                      validateOnChange={formState.invalid}
                      ml="auto"
                      justifyContent="flex-end"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                  </Box>
                </Flex>
              </React.Fragment>
            ) : null}
          </React.Fragment>
        )}
      </Form>
    )
  }
}

export default WalletSettings

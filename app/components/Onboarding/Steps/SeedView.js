/* eslint-disable react/no-multi-comp */
import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, intlShape, injectIntl } from 'react-intl'
import { Flex } from 'rebass'
import { Bar, Form, Header, Input, Message, Spinner, Text } from 'components/UI'
import messages from './messages'

const SeedWord = ({ index, word }) => (
  <Text as="li" my={2}>
    <Flex>
      <Text fontWeight="normal" width={25}>
        {index}
      </Text>
      <Text>{word}</Text>
    </Flex>
  </Text>
)
SeedWord.propTypes = {
  index: PropTypes.number.isRequired,
  word: PropTypes.string.isRequired
}

class SeedView extends React.Component {
  static propTypes = {
    wizardApi: PropTypes.object,
    wizardState: PropTypes.object,
    seed: PropTypes.array,
    fetchingSeed: PropTypes.bool,
    intl: intlShape.isRequired,
    fetchSeed: PropTypes.func.isRequired
  }

  static defaultProps = {
    wizardApi: {},
    wizardState: {},
    seed: [],
    fetchingSeed: false
  }

  componentDidMount() {
    const { seed, fetchSeed } = this.props
    if (seed.length === 0) {
      fetchSeed()
    }
  }

  componentDidUpdate(prevProps) {
    const { fetchingSeed, seed } = this.props
    if (seed && seed !== prevProps.seed) {
      this.formApi.setValue('seed', seed)
    }
    if (fetchingSeed && fetchingSeed !== prevProps.fetchingSeed) {
      this.formApi.setValue('seed', null)
      this.formApi.setTouched('seed', true)
    }
  }

  setFormApi = formApi => {
    this.formApi = formApi
  }

  render() {
    const { wizardApi, wizardState, seed, fetchSeed, fetchingSeed, intl, ...rest } = this.props
    const { getApi, onChange, onSubmit, onSubmitFailure } = wizardApi
    const { currentItem } = wizardState

    return (
      <Form
        {...rest}
        getApi={formApi => {
          this.setFormApi(formApi)
          if (getApi) {
            getApi(formApi)
          }
        }}
        onChange={onChange && (formState => onChange(formState, currentItem))}
        onSubmit={onSubmit}
        onSubmitFailure={onSubmitFailure}
      >
        {() => (
          <>
            <Header
              title={<FormattedMessage {...messages.save_seed_title} />}
              subtitle={<FormattedMessage {...messages.save_seed_description} />}
              align="left"
            />
            <Bar my={4} />

            {fetchingSeed && (
              <Text textAlign="center">
                <Spinner />
                <FormattedMessage {...messages.generating_seed} />
              </Text>
            )}
            {!fetchingSeed && seed.length > 0 && (
              <>
                <Flex justifyContent="space-between">
                  <Flex flexDirection="column" as="ul">
                    {seed.slice(0, 6).map((word, index) => (
                      <SeedWord key={index} index={index + 1} word={word} />
                    ))}
                  </Flex>
                  <Flex flexDirection="column" as="ul">
                    {seed.slice(6, 12).map((word, index) => (
                      <SeedWord key={index} index={index + 7} word={word} />
                    ))}
                  </Flex>
                  <Flex flexDirection="column" as="ul">
                    {seed.slice(12, 18).map((word, index) => (
                      <SeedWord key={index} index={index + 13} word={word} />
                    ))}
                  </Flex>
                  <Flex flexDirection="column" as="ul">
                    {seed.slice(18, 24).map((word, index) => (
                      <SeedWord key={index} index={index + 19} word={word} />
                    ))}
                  </Flex>
                </Flex>
                <Message variant="warning" justifyContent="center" mt={3}>
                  <FormattedMessage {...messages.seed_warning} />
                </Message>
              </>
            )}

            <Input
              field="seed"
              name="seed"
              type="hidden"
              validateOnBlur
              validateOnChange
              required
            />
          </>
        )}
      </Form>
    )
  }
}

export default injectIntl(SeedView)

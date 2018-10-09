import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import WalletUnlocker from 'containers/WalletUnlocker'

import configureStore from '../store'
import { DumyAppContainer } from '../helpers'

// Set up the store.
const store = configureStore()

storiesOf('Containers', module)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .addDecorator(story => <DumyAppContainer store={store}>{story()}</DumyAppContainer>)
  .add('WalletUnlocker', () => <WalletUnlocker />)

import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import { Box } from 'rebass'
import Text from 'components/UI/Text'
import Heading from 'components/UI/Heading'
import MainContent from 'components/UI/MainContent'
import Page from 'components/UI/Page'
import Sidebar from 'components/UI/Sidebar'
import Button from 'components/UI/Button'
import WalletsMenu from 'containers/WalletsMenu'
import WalletSettings from 'containers/WalletSettings'
import WalletUnlocker from 'containers/WalletUnlocker'
import FaRefresh from 'react-icons/lib/fa/refresh'
import FaDatabase from 'react-icons/lib/fa/database'

import configureStore from '../store'
import { clearDb, initDb } from '../db'
import { DumyAppContainer } from '../helpers'

// Set up the store.
const store = configureStore()

// Top level Pages story (re)initialises database state.
storiesOf('Pages', module)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .addDecorator(story => <DumyAppContainer store={store}>{story()}</DumyAppContainer>)
  .add('Intro', () => (
    <Page>
      <MainContent>
        <Box mb={3}>
          <Heading>Pages</Heading>
          <Text>
            <p>
              This section of the storybook combines multiple containers together to form pages,
              very similar to how we do so withibn the app. Application state is persisted in the
              browser&#39;s IndexedDB database.
            </p>
            <p>
              Clicking the button below will initialise your browser with a set of basic sample data
              which is useful so that you can see how the containers function with some data already
              present.
            </p>
          </Text>
        </Box>
        <Box>
          <Button onClick={() => initDb().then(alert('Sample data was loaded'))}>
            <FaDatabase /> Load sample data
          </Button>{' '}
          <Button onClick={() => clearDb().then(alert('Database has been reset'))}>
            <FaRefresh /> Reset database
          </Button>
        </Box>
      </MainContent>
    </Page>
  ))
  .add('Home', () => (
    <Page>
      <Sidebar.small>
        <WalletsMenu />
      </Sidebar.small>
      <MainContent>
        <WalletSettings />
      </MainContent>
    </Page>
  ))
  .add('WalletUnlocker', () => (
    <Page>
      <Sidebar.small>
        <WalletsMenu />
      </Sidebar.small>
      <MainContent>
        <WalletUnlocker />
      </MainContent>
    </Page>
  ))

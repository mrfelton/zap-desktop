import React from 'react'
import { storiesOf } from '@storybook/react'
import Icon from 'components/UI/Icon'

storiesOf('Icon', module)
  .add('Success', () => <Icon variant="success" />)
  .add('Warning', () => <Icon variant="warning" />)
  .add('Error', () => <Icon variant="error" />)
  .add('Previous', () => <Icon variant="previous" />)
  .add('Next', () => <Icon variant="next" />)

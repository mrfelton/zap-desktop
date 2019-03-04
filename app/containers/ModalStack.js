import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { animated, Transition } from 'react-spring'
import styled from 'styled-components'
import { closeModal, modalSelectors } from 'reducers/modal'
import { Modal, ModalOverlayStyles } from 'components/UI'
import { useOnKeydown } from 'hooks'
import Pay from 'containers/Pay'
import Request from 'containers/Request'
import Channels from 'containers/Channels'
import ChannelCloseDialog from 'containers/Channels/ChannelCloseDialog'
import ChannelDetail from 'containers/Channels/ChannelDetail'
import ChannelCreate from 'containers/Channels/ChannelCreate'
import ReceiveModal from 'containers/Wallet/ReceiveModal'
import ActivityModal from 'containers/Activity/ActivityModal'

const Container = styled(animated.div)`
  ${ModalOverlayStyles}
`

const ModalContent = ({ type, closeModal }) => {
  switch (type) {
    case 'PAY_FORM':
      return <Pay width={9 / 16} mx="auto" />

    case 'REQUEST_FORM':
      return <Request width={9 / 16} mx="auto" />

    case 'RECEIVE_MODAL':
      return <ReceiveModal width={9 / 16} mx="auto" />

    case 'ACTIVITY_MODAL':
      return <ActivityModal width={9 / 16} mx="auto" />

    case 'CHANNELS':
      return <Channels mx={-4} />

    case 'CHANNEL_CREATE':
      return <ChannelCreate mx={-4} onSubmit={() => closeModal()} />

    case 'CHANNEL_DETAIL':
      return (
        <>
          <ChannelDetail mx={-4} />
          <ChannelCloseDialog />
        </>
      )
  }
}

ModalContent.propTypes = {
  type: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired
}

function ModalStack(props) {
  const { modals, closeModal } = props

  useOnKeydown('Escape', closeModal)

  return (
    <Transition
      items={modals}
      keys={item => item.id}
      from={{ opacity: 0, pointerEvents: 'auto' }}
      enter={{ opacity: 1, pointerEvents: 'auto' }}
      leave={{ opacity: 0, pointerEvents: 'none' }}
    >
      {modal =>
        modal &&
        /* eslint-disable react/display-name */
        (styles => (
          <Container style={styles}>
            <Modal onClose={() => closeModal(modal.id)}>
              <ModalContent type={modal.type} closeModal={closeModal} />
            </Modal>
          </Container>
        ))
      }
    </Transition>
  )
}

ModalStack.propTypes = {
  modals: PropTypes.array.isRequired,
  closeModal: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  modals: modalSelectors.getModalState(state)
})

const mapDispatchToProps = {
  closeModal
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalStack)

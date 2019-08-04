import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { bitcoindSelectors } from 'reducers/bitcoind'
import { setIsWalletOpen } from 'reducers/wallet'
import { showNotification } from 'reducers/notification'
import Bitcoind from 'components/Bitcoind'
import { Modal, ModalOverlayStyles } from 'components/UI'
import { useOnKeydown } from 'hooks'

const mapStateToProps = state => ({
  syncStatus: bitcoindSelectors.bitcoindSyncStatus(state),
  syncPercentage: bitcoindSelectors.bitcoindSyncPercentage(state),
  blockHeight: bitcoindSelectors.blockHeight(state),
  bitcoindBlockHeight: bitcoindSelectors.bitcoindBlockHeight(state),
  isRpcActive: state.bitcoind.isRpcActive,
})

const mapDispatchToProps = {
  setIsWalletOpen,
  showNotification,
}

const SyncingContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Bitcoind)

const ModalOverlay = styled.div`
  ${ModalOverlayStyles}
`

const SyncingModal = ({ onClose, ...rest }) => {
  useOnKeydown('Escape', onClose)
  return (
    <ModalOverlay>
      <Modal hasClose onClose={onClose} {...rest} p={4}>
        <SyncingContainer />
      </Modal>
    </ModalOverlay>
  )
}

SyncingModal.propTypes = {
  onClose: PropTypes.func.isRequired,
}

export default SyncingModal

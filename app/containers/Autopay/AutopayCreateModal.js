import { connect } from 'react-redux'
import AutopayCreateModal from 'components/Autopay/AutopayCreateModal'
import { closeAutopayCreateModal, autopaySelectors } from 'reducers/autopay'

const mapStateToProps = state => ({
  isOpen: autopaySelectors.isCreateModalOpen(state),
})

const mapDispatchToProps = dispatch => ({
  onClose() {
    dispatch(closeAutopayCreateModal())
  },

  onCancel() {
    dispatch(closeAutopayCreateModal())
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AutopayCreateModal)

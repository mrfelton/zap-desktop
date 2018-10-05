import React from 'react'
import PropTypes from 'prop-types'
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle'
import FaTimesCircle from 'react-icons/lib/fa/times-circle'
import FaCheckCircle from 'react-icons/lib/fa/check-circle'
import MdNavigateBefore from 'react-icons/lib/md/navigate-before'
import MdNavigateNext from 'react-icons/lib/md/navigate-next'

/**
 * @render react
 * @name Icon
 * @example
 * <Icon variant="success" />
 */
class Icon extends React.PureComponent {
  render() {
    const { variant } = this.props
    switch (variant) {
      case 'success':
        return <FaCheckCircle {...this.props} />
      case 'warning':
        return <FaExclamationCircle {...this.props} />
      case 'error':
        return <FaTimesCircle {...this.props} />
      case 'previous':
        return <MdNavigateBefore {...this.props} />
      case 'next':
        return <MdNavigateNext {...this.props} />
    }
  }
}

Icon.displayName = 'Icon'
Icon.defaultProps = {
  variant: 'success'
}
Icon.propTypes = {
  variant: PropTypes.string
}

export default Icon

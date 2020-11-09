import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedDate, FormattedTime } from 'react-intl'
import { settingsSelectors } from 'reducers/settings'

const mapStateToProps = state => ({
  timeDisplayMode: settingsSelectors.currentConfig(state).timeDisplayMode,
})

const FormattedDateTime = ({ timeDisplayMode, format, month = 'long', value }) => {
  const hour12 = timeDisplayMode && timeDisplayMode === '12hour' ? 1 : 0
  switch (format) {
    case 'date':
      return <FormattedDate day="2-digit" month={month} value={value} year="numeric" />
    case 'time':
      return <FormattedTime hour12={hour12} value={value} />
    default:
      return (
        <FormattedDate
          day="2-digit"
          hour="numeric"
          hour12={hour12}
          minute="numeric"
          month={month}
          value={value}
          year="numeric"
        />
      )
  }
}

FormattedDateTime.propTypes = {
  format: PropTypes.string,
  month: PropTypes.string,
  timeDisplayMode: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
}

export default connect(mapStateToProps)(FormattedDateTime)

import React from 'react'
import PropTypes from 'prop-types'
import { Box } from 'rebass'
import { ChannelSummaryListItem } from 'components/Channels'

const ChannelSummaryList = ({ channels, openModal, setSelectedChannel, ...rest }) => (
  <Box as="article" {...rest}>
    {channels.map(channelObj => {
      const channel = channelObj.channel || channelObj

      return (
        <ChannelSummaryListItem
          key={channel.channel_point}
          channel={channel}
          openModal={openModal}
          setSelectedChannel={setSelectedChannel}
          mb={3}
        />
      )
    })}
  </Box>
)

ChannelSummaryList.propTypes = {
  channels: PropTypes.array,
  openModal: PropTypes.func.isRequired,
  setSelectedChannel: PropTypes.func.isRequired
}

ChannelSummaryList.defaultProps = {
  channels: []
}

export default ChannelSummaryList
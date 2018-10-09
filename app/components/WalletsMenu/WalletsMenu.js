import React from 'react'
import PropTypes from 'prop-types'
import Menu from 'components/UI/Menu'
import MenuItemGroup from 'components/UI/MenuItemGroup'
import MenuItem from 'components/UI/MenuItem'

/**
 * @render react
 * @name WalletsMenu
 * @example
 * <WalletsMenu
     wallet={{ ... }}
     saveWalletsMenu={() => {}}
     setError={() => {}} >
 */
export class WalletsMenu extends React.Component {
  static displayName = 'WalletsMenu'

  static propTypes = {
    wallets: PropTypes.object.isRequired,
    openWalletSettings: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    })
  }

  constructor(props) {
    super(props)

    this.onSelect = this.onSelect.bind(this)
  }

  /**
   * Handler for selecting menu items.
   * @param  {Object} info menu state information.
   */
  onSelect(info) {
    const { history, openWalletSettings } = this.props
    openWalletSettings({ id: info.key, history })
  }

  /**
   * Form renderer.
   * @return {[type]} [description]
   */
  render() {
    const { wallets } = this.props
    return (
      <Menu onSelect={this.onSelect}>
        <MenuItemGroup title="Your Wallets">
          {Object.keys(wallets).map(id => (
            <MenuItem key={id}>{wallets[id].name}</MenuItem>
          ))}
        </MenuItemGroup>
      </Menu>
    )
  }
}

export default WalletsMenu

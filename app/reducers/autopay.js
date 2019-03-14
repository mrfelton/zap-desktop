import { createSelector } from 'reselect'
import { contactFormSelectors } from './contactsform'

// Initial State
const initialState = {
  isCreateModalOpen: false,
  searchQuery: null,
  merchants: [],
}

// Constants
// ------------------------------------
export const UPDATE_AUTOPAY_SEARCH_QUERY = 'UPDATE_AUTOPAY_SEARCH_QUERY'
export const OPEN_AUTOPAY_CREATE_MODAL = 'OPEN_AUTOPAY_CREATE_MODAL'
export const CLOSE_AUTOPAY_CREATE_MODAL = 'CLOSE_AUTOPAY_CREATE_MODAL'

// ------------------------------------
// Actions
// ------------------------------------
export function updateAutopaySearchQuery(searchQuery) {
  return {
    type: UPDATE_AUTOPAY_SEARCH_QUERY,
    searchQuery,
  }
}

export function openAutopayCreateModal() {
  return {
    type: OPEN_AUTOPAY_CREATE_MODAL,
  }
}

export function closeAutopayCreateModal() {
  return {
    type: CLOSE_AUTOPAY_CREATE_MODAL,
  }
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [UPDATE_AUTOPAY_SEARCH_QUERY]: (state, { searchQuery }) => ({ ...state, searchQuery }),
  [OPEN_AUTOPAY_CREATE_MODAL]: state => ({ ...state, isCreateModalOpen: true }),
  [CLOSE_AUTOPAY_CREATE_MODAL]: state => ({ ...state, isCreateModalOpen: false }),
}

// ------------------------------------
// Selector
// ------------------------------------
const autopaySelectors = {}
autopaySelectors.searchQuery = state => state.autopay.searchQuery
autopaySelectors.isCreateModalOpen = state => state.autopay.isCreateModalOpen
autopaySelectors.merchants = state => contactFormSelectors.suggestedNodes(state)

autopaySelectors.filteredMerchants = createSelector(
  autopaySelectors.merchants,
  autopaySelectors.searchQuery,
  (merchants, searchQuery) => {
    if (!searchQuery) {
      return merchants
    }
    const cleanedSearchQuery = searchQuery.toLowerCase()
    return merchants.filter(m => m.nickname.toLowerCase().includes(cleanedSearchQuery))
  }
)

export { autopaySelectors }

// ------------------------------------
// Reducer
// ------------------------------------
export default function autopayReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

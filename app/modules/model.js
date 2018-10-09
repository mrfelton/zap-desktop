import Duck from 'extensible-duck'
import dotProp from 'dot-prop-immutable'

export default function model({ namespace, store, initialState = {} }) {
  return new Duck({
    namespace,
    store,

    consts: { statuses: ['NEW', 'LOADING', 'READY', 'SAVING', 'SAVED'] },

    types: [
      'UPDATE',
      'UPDATE_ENTITIES',

      'FETCH',
      'FETCH_PENDING',
      'FETCH_FULFILLED',
      'FETCH_ERROR',

      'POST',
      'POST_PENDING',
      'POST_FULFILLED',
      'POST_ERROR'
    ],

    reducer: (state, action, { types, statuses }) => {
      switch (action.type) {
        // Fetch (all)
        case types.FETCH_PENDING:
          return { ...state, status: statuses.LOADING }
        case types.FETCH_FULFILLED:
          return { ...state, status: statuses.READY }

        // Post (single)
        case types.POST_PENDING:
          return { ...state, status: statuses.SAVING }
        case types.POST_FULFILLED:
          return { ...state, status: statuses.SAVED }

        // Update from db (single)
        case types.UPDATE:
          var updatedWithObj = dotProp.set(state, `obj`, action.payload)
          var updatedWithEntities = dotProp.set(
            updatedWithObj,
            `entities.byId.${action.payload.id}`,
            action.payload
          )
          return updatedWithEntities

        // Update from db (all)
        case types.UPDATE_ENTITIES:
          return dotProp.set(state, `entities.byId`, action.payload)

        default:
          return state
      }
    },

    creators: ({ types }) => ({
      update: payload => ({ type: types.UPDATE, payload }),
      updateEntities: payload => ({ type: types.UPDATE_ENTITIES, payload }),

      fetch: payload => ({ type: types.FETCH, payload }),
      fetchPending: () => ({ type: types.FETCH_PENDING }),
      fetchFulfilled: () => ({ type: types.FETCH_FULFILLED }),
      fetchError: payload => ({ type: types.FETCH_ERROR, payload, error: true }),

      post: payload => ({ type: types.POST, payload: payload }),
      postPending: () => ({ type: types.POST_PENDING }),
      postFulfilled: () => ({ type: types.POST_FULFILLED }),
      postError: payload => ({ type: types.POST_ERROR, payload, error: true })
    }),

    initialState: ({ statuses }) => ({
      obj: initialState || {},
      status: statuses.NEW,
      entities: {
        byId: {}
      },
      currentItem: null
    })
  })
}

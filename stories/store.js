import logger from 'redux-logger'
import thunk from 'redux-thunk'
import { applyMiddleware, createStore, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import rootReducer from './rootReducer'
import registerSagas from './sagas'

const configureStore = (initialState = {}) => {
  // Set up sagas.
  const sagaMiddleware = createSagaMiddleware()

  // Enable Redux dev tools
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  // Apply all middleware.
  const middleware = applyMiddleware(thunk, sagaMiddleware, logger)

  // Create the store.
  const store = createStore(rootReducer, initialState, composeEnhancers(middleware))

  //Start sagas.
  registerSagas(sagaMiddleware)

  // Return the store.
  return store
}

export default configureStore

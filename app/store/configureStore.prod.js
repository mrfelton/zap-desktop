import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { createHashHistory } from 'history'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import rootReducer from '../reducers'
import ipc from '../reducers/ipc'

export const history = createHashHistory({ basename: window.location.pathname })

export function configureStore(initialState) {
  const middleware = []
  const enhancers = []

  middleware.push(thunk)

  // Router Middleware
  const router = routerMiddleware(history)
  middleware.push(router)

  middleware.push(ipc)

  enhancers.push(applyMiddleware(...middleware))
  const enhancer = compose(...enhancers)

  return createStore(connectRouter(history)(rootReducer), initialState, enhancer)
}

import { apply, call, put, takeEvery } from 'redux-saga/effects'
import wallet from 'modules/wallet'
import { getDb } from '../db'

const db = getDb()

// Helper method to convert an array of objects into a keyed collection of objects.
const arrayToObject = (array, keyField) =>
  array.reduce((obj, item) => {
    obj[item[keyField]] = item
    return obj
  }, {})

// Wallets API
const Api = {
  post: data => db.connections.put(data),
  fetch: () => db.connections.toArray().then(data => arrayToObject(data, 'id'))
}

// ------------------------------------
// Watchers
// ------------------------------------
export function* watchSaveWalletSettings() {
  yield takeEvery(wallet.types.SAVE_WALLET_SETTINGS, saveWalletSettings)
}
export function* watchFetchWallet() {
  yield takeEvery(wallet.types.FETCH, fetchWallets)
}
export function* watchPostWallet() {
  yield takeEvery(wallet.types.POST, postWallet)
}
export function* watchUnlockWallet() {
  yield takeEvery(wallet.types.UNLOCK_WALLET, unlockWallet)
}
export function* watchOpenWalletSettings() {
  yield takeEvery(wallet.types.OPEN_WALLET_SETTINGS, openWalletSettings)
}

// ------------------------------------
// Generators
// ------------------------------------
function* fetchWallets() {
  try {
    yield put(wallet.creators.fetchPending())
    const data = yield call(Api.fetch)
    yield put(wallet.creators.fetchFulfilled())
    yield put(wallet.creators.updateEntities(data))
  } catch (error) {
    yield put(wallet.creators.fetchError())
    return Promise.reject(error)
  }
}

function* postWallet(action) {
  try {
    const { values } = action.payload
    yield put(wallet.creators.postPending())
    yield call(Api.post, values)
    yield put(wallet.creators.postFulfilled())
    yield put(wallet.creators.update(values))
  } catch (error) {
    yield put(wallet.creators.postError())
    return Promise.reject(error)
  }
}

function* saveWalletSettings(action) {
  try {
    const { history, values } = action.payload
    yield call(postWallet, action)
    yield put(wallet.creators.saveWalletSettingsSucceeded())
    yield apply(history, history.push, [`/wallets/${values.id}/unlock`])
  } catch (error) {
    yield put(wallet.creators.saveWalletSettingsFailed(error))
  }
}

function* openWalletSettings(action) {
  const { history, id } = action.payload
  yield put(wallet.creators.setCurrentWallet({ id }))
  yield apply(history, history.push, [`/wallets/${id}`])
}

function* unlockWallet() {
  try {
    // const { id, password } = action.payload
    // yield put(wallet.creators.unlockWallet({ id, password }))
    yield put(wallet.creators.unlockWalletSucceeded())
  } catch (error) {
    yield put(wallet.creators.unlockWalletFailed())
  }
}

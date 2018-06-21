import axios from 'axios'

// When running in development/hot mode where the application code is served up via webpack dev server
// access these remote resources through a proxy that has been defined on the dev server to prevent CORS issues.
const scheme = process.env.HOT ? '/proxy/' : 'https://'

export function requestTicker(id) {
  const BASE_URL = `${scheme}api.coinmarketcap.com/v1/ticker/${id}`
  return axios({
    method: 'get',
    url: BASE_URL
  })
    .then(response => response.data)
    .catch(error => error)
}

export function requestTickers(ids) {
  return axios
    .all(ids.map(id => requestTicker(id)))
    .then(
      axios.spread((btcTicker, ltcTicker) => ({ btcTicker: btcTicker[0], ltcTicker: ltcTicker[0] }))
    )
}

export function requestBlockHeight() {
  const BASE_URL = `${scheme}testnet-api.smartbit.com.au/v1/blockchain/blocks?limit=1`
  return axios({
    method: 'get',
    url: BASE_URL
  })
    .then(response => response.data)
    .catch(error => error)
}

export function requestSuggestedNodes() {
  const BASE_URL = `${scheme}zap.jackmallers.com//suggested-peers`
  return axios({
    method: 'get',
    url: BASE_URL
  })
    .then(response => response.data)
    .catch(error => error)
}

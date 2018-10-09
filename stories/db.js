import { getDb } from '../app/db'

const db = getDb()

// Reset the database and then recreate with sample data.
export const initDb = async () => {
  return db.connections.clear().then(() =>
    db.connections.bulkAdd([
      {
        id: 'd2a3594c-d695-4870-a8df-8eddbd197db1',
        name: 'Wallet 1',
        chain: 'btc',
        autopilot: true,
        autopilotMaxChannels: 5,
        autopilotAllocation: 0.5
      },
      {
        id: 'ef9eb914-0010-4bf8-a169-7c78fac5e05a',
        name: 'Wallet 2',
        chain: 'ltc',
        autopilot: false,
        autopilotMaxChannels: 10,
        autopilotAllocation: 0.8
      }
    ])
  )
}

// Reset the database.
export const clearDb = async () => {
  return db.connections.clear()
}

export default db

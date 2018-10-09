import Dexie from 'dexie'

export const getDb = name => {
  const dbName = name || `ZapDesktop.${process.env.NODE_ENV}`

  // Define the database.
  const db = new Dexie(dbName)
  db.version(1).stores({ connections: '++id, chain, network' })

  return db
}

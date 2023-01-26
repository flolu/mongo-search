import express from 'express'
import {mongoClient, MONGODB_COLLECTION} from './util'
import {User} from './util'

const app = express()

app.get('/search', async (req, res) => {
  const searchQuery = req.query.query as string

  const db = mongoClient.db('tutorial')
  const collection = db.collection<User>(MONGODB_COLLECTION)

  const result = await collection
    .find({$text: {$search: searchQuery, $caseSensitive: false, $diacriticSensitive: false}})
    .project({score: {$meta: 'textScore'}, _id: 0})
    .sort({score: {$meta: 'textScore'}})
    .limit(10)

  const array = await result.toArray()

  res.json(array)
})

async function main() {
  try {
    await mongoClient.connect()

    const db = mongoClient.db('tutorial')
    const collection = db.collection<User>(MONGODB_COLLECTION)

    // Text index for searching fullName and email
    await collection.createIndexes([{name: 'fullName_email_text', key: {fullName: 'text', email: 'text'}}])

    app.listen(3000, () => console.log('http://localhost:3000/search?query=flo'))
  } catch (err) {
    console.log(err)
  }

  process.on('SIGTERM', async () => {
    await mongoClient.close()
    process.exit(0)
  })
}

main()

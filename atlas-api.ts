import express from 'express'
import {request} from 'urllib'
import {mongoClient, MONGODB_COLLECTION, MONGODB_DATABASE, User} from './util'

const ATLAS_API_BASE_URL = 'https://cloud.mongodb.com/api/atlas/v1.0'
const ATLAS_PROJECT_ID = process.env.MONGODB_ATLAS_PROJECT_ID
const ATLAS_CLUSTER_NAME = process.env.MONGODB_ATLAS_CLUSTER
const ATLAS_CLUSTER_API_URL = `${ATLAS_API_BASE_URL}/groups/${ATLAS_PROJECT_ID}/clusters/${ATLAS_CLUSTER_NAME}`

const ATLAS_API_PUBLIC_KEY = process.env.MONGODB_ATLAS_PUBLIC_KEY
const ATLAS_API_PRIVATE_KEY = process.env.MONGODB_ATLAS_PRIVATE_KEY
const DIGEST_AUTH = `${ATLAS_API_PUBLIC_KEY}:${ATLAS_API_PRIVATE_KEY}`

const USER_SEARCH_INDEX_NAME = 'user_search'

const app = express()

app.get('/search', async (req, res) => {
  const searchQuery = req.query.query as string
  const country = req.query.country as string

  const db = mongoClient.db('tutorial')
  const collection = db.collection<User>(MONGODB_COLLECTION)

  const pipeline = []

  if (country) {
    pipeline.push({
      $search: {
        index: USER_SEARCH_INDEX_NAME,
        compound: {
          must: [
            {
              text: {
                query: searchQuery,
                path: {wildcard: '*'},
                fuzzy: {},
              },
            },
            {
              text: {
                query: country,
                path: 'country',
              },
            },
          ],
        },
      },
    })
  } else {
    pipeline.push({
      $search: {
        index: USER_SEARCH_INDEX_NAME,
        text: {
          query: searchQuery,
          path: {wildcard: '*'},
          fuzzy: {},
        },
      },
    })
  }

  pipeline.push({
    $project: {
      _id: 0,
      score: {$meta: 'searchScore'},
      userId: 1,
      fullName: 1,
      email: 1,
      avatar: 1,
      registeredAt: 1,
      country: 1,
    },
  })

  const result = await collection.aggregate(pipeline).sort({score: -1}).limit(10)
  const array = await result.toArray()
  res.json(array)
})

async function upsertSearchIndex() {
  const searchIndexUrl = `${ATLAS_CLUSTER_API_URL}/fts/indexes`

  const allIndexesResponse = await request(`${searchIndexUrl}/${MONGODB_DATABASE}/${MONGODB_COLLECTION}`, {
    dataType: 'json',
    contentType: 'application/json',
    method: 'GET',
    digestAuth: DIGEST_AUTH,
  })

  const userSearchIndex = (allIndexesResponse.data as any[]).find((i) => i.name === USER_SEARCH_INDEX_NAME)
  if (!userSearchIndex) {
    await request(searchIndexUrl, {
      // https://www.mongodb.com/docs/atlas/atlas-search/index-definitions/#options
      data: {
        database: MONGODB_DATABASE,
        collectionName: MONGODB_COLLECTION,
        name: USER_SEARCH_INDEX_NAME,
        mappings: {
          dynamic: true,
        },
      },
      dataType: 'json',
      contentType: 'application/json',
      method: 'POST',
      digestAuth: DIGEST_AUTH,
    })
  }
}

async function main() {
  try {
    await mongoClient.connect()
    await upsertSearchIndex()

    app.listen(3001, () => console.log('http://localhost:3001/search?query=gilbert'))
  } catch (err) {
    console.log(err)
  }

  process.on('SIGTERM', async () => {
    await mongoClient.close()
    process.exit(0)
  })
}

main()

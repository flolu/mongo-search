import express from 'express'
import {request} from 'urllib'
import cors from 'cors'
import {mongoClient, MONGODB_COLLECTION, MONGODB_DATABASE, User} from './util'

const ATLAS_API_BASE_URL = 'https://cloud.mongodb.com/api/atlas/v1.0'
const ATLAS_PROJECT_ID = process.env.MONGODB_ATLAS_PROJECT_ID
const ATLAS_CLUSTER_NAME = process.env.MONGODB_ATLAS_CLUSTER
const ATLAS_CLUSTER_API_URL = `${ATLAS_API_BASE_URL}/groups/${ATLAS_PROJECT_ID}/clusters/${ATLAS_CLUSTER_NAME}`
const ATLAS_SEARCH_INDEX_API_URL = `${ATLAS_CLUSTER_API_URL}/fts/indexes`

const ATLAS_API_PUBLIC_KEY = process.env.MONGODB_ATLAS_PUBLIC_KEY
const ATLAS_API_PRIVATE_KEY = process.env.MONGODB_ATLAS_PRIVATE_KEY
const DIGEST_AUTH = `${ATLAS_API_PUBLIC_KEY}:${ATLAS_API_PRIVATE_KEY}`

const USER_SEARCH_INDEX_NAME = 'user_search'
const USER_AUTOCOMPLETE_INDEX_NAME = 'user_autocomplete'

const app = express()

app.use(cors({credentials: true, origin: 'http://localhost:4000'}))

app.get('/search', async (req, res) => {
  const searchQuery = req.query.query as string
  const country = req.query.country as string

  if (!searchQuery || searchQuery.length < 2) {
    res.json([])
    return
  }

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
                path: ['fullName', 'email'],
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
          path: ['fullName', 'email'],
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

app.get('/autocomplete', async (req, res) => {
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
              autocomplete: {
                query: searchQuery,
                path: 'fullName',
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
        index: USER_AUTOCOMPLETE_INDEX_NAME,
        // https://www.mongodb.com/docs/atlas/atlas-search/autocomplete/#options
        autocomplete: {
          query: searchQuery,
          path: 'fullName',
          tokenOrder: 'sequential',
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

async function findIndexByName(indexName: string) {
  const allIndexesResponse = await request(
    `${ATLAS_SEARCH_INDEX_API_URL}/${MONGODB_DATABASE}/${MONGODB_COLLECTION}`,
    {
      dataType: 'json',
      contentType: 'application/json',
      method: 'GET',
      digestAuth: DIGEST_AUTH,
    }
  )

  return (allIndexesResponse.data as any[]).find((i) => i.name === indexName)
}

async function upsertSearchIndex() {
  const userSearchIndex = await findIndexByName(USER_SEARCH_INDEX_NAME)
  if (!userSearchIndex) {
    await request(ATLAS_SEARCH_INDEX_API_URL, {
      data: {
        name: USER_SEARCH_INDEX_NAME,
        database: MONGODB_DATABASE,
        collectionName: MONGODB_COLLECTION,
        // https://www.mongodb.com/docs/atlas/atlas-search/index-definitions/#syntax
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

async function upsertAutocompleteIndex() {
  const userAutocompleteIndex = await findIndexByName(USER_AUTOCOMPLETE_INDEX_NAME)
  if (!userAutocompleteIndex) {
    await request(ATLAS_SEARCH_INDEX_API_URL, {
      data: {
        name: USER_AUTOCOMPLETE_INDEX_NAME,
        database: MONGODB_DATABASE,
        collectionName: MONGODB_COLLECTION,
        // https://www.mongodb.com/docs/atlas/atlas-search/autocomplete/#index-definition
        mappings: {
          dynamic: false,
          fields: {
            fullName: [
              {
                foldDiacritics: false,
                maxGrams: 7,
                minGrams: 3,
                tokenization: 'edgeGram',
                type: 'autocomplete',
              },
            ],
          },
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
    await upsertAutocompleteIndex()

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

import {config} from 'dotenv'
import {MongoClient} from 'mongodb'
import {faker} from '@faker-js/faker'

config()

const MONGODB_HOST = process.env.MONGODB_HOST!
const MONGODB_USER = process.env.MONGODB_USERNAME
const MONGODB_PASS = process.env.MONGODB_PASSWORD

const mongoClient = new MongoClient(MONGODB_HOST, {
  auth: {username: MONGODB_USER, password: MONGODB_PASS},
})

function createRandomUser() {
  return {
    userId: faker.datatype.uuid(),
    fullName: faker.name.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    registeredAt: faker.date.past(),
  }
}

async function main() {
  try {
    const db = mongoClient.db('tutorial')
    const collection = db.collection('users')

    const users = Array.from({length: 10000 - 10}).map(createRandomUser)

    await collection.insertMany(users)
  } catch (err) {
    console.log(err)
  } finally {
    await mongoClient.close()
  }
}

main()

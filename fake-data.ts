import {config} from 'dotenv'
import {faker} from '@faker-js/faker'
import {User} from './util'

config()

import {mongoClient} from './database'

function createRandomUser() {
  return {
    userId: faker.datatype.uuid(),
    fullName: faker.name.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    registeredAt: faker.date.past(),
  }
}

async function main() {
  try {
    const db = mongoClient.db('tutorial')
    const collection = db.collection<User>('users')

    const users = Array.from({length: 10000}).map((_value, index) => {
      faker.seed(index)
      return createRandomUser()
    })

    await collection.insertMany(users)
  } catch (err) {
    console.log(err)
  } finally {
    await mongoClient.close()
  }
}

main()

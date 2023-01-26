<div align="center">
  <!-- <a href="https://github.com/flolu/auth">
    <img width="100px" height="auto" src="./.github/thumbnail.png" />
  </a> -->
  <br>
  <h1>MongoDB Text Search With Node.js</h1>
  <!-- <p></p> -->
</div>

# Features

- TODO

# Tech Stack

- [Node.js](https://nodejs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Docker](https://www.docker.com)
- [MongoDB](https://mongodb.com)
- [MongoDB Compass](https://www.mongodb.com/de-de/products/compass)

# Usage

**Recommended OS**: Linux

**Requirements**: Node.js, Docker

**Setup**

- `npm install` (Install NPM dependencies)
- `docker-compose -f docker-compose.yml up --build` (Start services)
- `npx ts-node fake-data.ts` (Add fake data to MongoDB)
- `mongodb://admin:password@localhost:27017` (MongoDB Compass connection URI)

**Cleanup**

- `docker-compose -f docker-compose.yml rm -s -f -v` (Stop and remove Docker containers)

# Codebase

- [`api.ts`](api.ts) (Small Node.js API to fetch search results from MongoDB)
- [`fake-data.ts`](fake-data.ts) (Script to populate MongoDB with fake data)

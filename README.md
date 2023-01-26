<div align="center">
  <!-- <a href="https://github.com/flolu/mongo-search">
    <img width="100px" height="auto" src="./.github/thumbnail.png" />
  </a> -->
  <br>
  <h1>MongoDB Text Search With Node.js</h1>
  <p>Fuzzy Text Search And Autocompletion With MongoDB And Node.js</p>
</div>

# Features

- Exact match text search with self-deployed MongoDB
- **Fuzzy text search** with MongoDB Atlas
- Text **autocompletion**
- **Sort search results** by score
- Search through multiple text fields
- Limit search results to specific country code
- Populate database with fake users
- Small user interface for searching

# Tech Stack

- [Node.js](https://nodejs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Docker](https://www.docker.com)
- Self-deployed [MongoDB](https://mongodb.com) or [MongoDB Atlas](https://www.mongodb.com/atlas/database)

# Usage

**Recommended OS**: Linux

**Requirements**: Node.js, Docker

**Setup**

- `npm install` (Install NPM dependencies for server)
- `docker-compose -f docker-compose.yml up --build` (Start services)

**Self Deployed Search**

- `npx ts-node fake-data.ts .env.local` (Add fake data to MongoDB)
- `mongodb://admin:password@localhost:27017` (MongoDB Compass connection URI)
- http://localhost:3000/search?query=gilbert (Basic search)

**MongoDB Atlas Search**

- Create [MongoDB Atlas](https://cloud.mongodb.com) cluster
- Create API Key for your project
  1. Go to Project Settings
  2. Select Access Manager
  3. Select API Keys
  4. Create API Key
  5. Set Project Permissions to Project Search Index Editor
  6. Set `MONGODB_ATLAS_PUBLIC_KEY` and `MONGODB_ATLAS_PRIVATE_KEY` in `.env.atlas`
- `npx ts-node fake-data.ts .env.atlas` (Add fake data to MongoDB)
- http://localhost:3001/search?query=gilbert (Fuzzy search)

**User interface**

- `cd client && npm install` (Install NPM dependencies for client)
- `cd client && npm run dev` (Start user interface in development mode, http://localhost:4000)

**Cleanup**

- `docker-compose -f docker-compose.yml rm -s -f -v` (Stop and remove Docker containers)

# Codebase

- [`self-deployed-api.ts`](self-deployed-api.ts) (Node.js API to fetch search results from self-deployed MongoDB)
- [`atlas-api.ts`](atlas-api.ts) (Node.js API to fetch search results from MongoDB Atlas, which has more features)
- [`fake-data.ts`](fake-data.ts) (Script to populate MongoDB with fake data)
- [`util.ts`](util.ts) (Utilities for TypeScript and MongoDB)

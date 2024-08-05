// ESM
import fastifyPlugin from 'fastify-plugin'
import fastifyMongo from '@fastify/mongodb'

async function dbConnector (fastify, options) {
  fastify.register(fastifyMongo, {
    url: process.env.MONGOD_CONNECT_URI
  })
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
export default fastifyPlugin(dbConnector)
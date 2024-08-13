/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
import fastifyPlugin from 'fastify-plugin'

async function routes (fastify, options) {
    const collection = fastify.mongo.db.collection('works')
  
    fastify.get('/', async (request, reply) => {
      return { hello: 'world' }
    })
  
    fastify.get('/works', async (request, reply) => {
      const result = await collection.find().toArray()
      if (result.length === 0) {
        throw new Error('No documents found')
      }
      return result
    })

  /*
    fastify.get('/animals/:animal', async (request, reply) => {
      const result = await collection.findOne({ animal: request.params.animal })
      if (!result) {
        throw new Error('Invalid value')
      }
      return result
    })
  */
    const workBodyJsonSchema = {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string' },
      },
    }
  
    const schema = {
      body: workBodyJsonSchema,
    }
  
    /*fastify.post('/works', { schema }, async (request, reply) => {
      // we can use the `request.body` object to get the data sent by the client
      const result = await collection.insertOne({ animal: request.body.animal })
      return result
    })*/
  }
  
//  module.exports = routes
  export default fastifyPlugin(routes)
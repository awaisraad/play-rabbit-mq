const cluster = require('cluster')
const { cpus } = require('os')
const express = require('express')
const amqp = require('amqplib')

const app = express()
const PORT = 3000

async function main() {
  const rpc = new RPC()
  await rpc.init()

  const router = express.Router()

  router.get('/', (req, res) => res.json({ message: 'Hello World' }))

  router.get('/:number', async (req, res) => {
    const number = parseInt(req.params['number'])

    rpc.request(number, result => res.json({ number, result }))
  })

  app.use(router)

  app.listen(PORT, () => console.log(`Application Started at port ${PORT}`))
}


function RPC() {
  const store = new Map()

  let connection, q

  /** @type {Channel} */
  let ch

  this.init = async () => {
    connection = await amqp.connect('amqp://localhost')

    ch = await connection.createChannel()
    q = await ch.assertQueue('', { exclusive: true })

    ch.consume(q.queue, msg => {
      if (store.has(msg.properties.correlationId)) {
        const callback = store.get(msg.properties.correlationId)
        store.delete(msg.properties.correlationId)

        callback(msg.content.toString())
      }
    }, { noAck: true })
  }

  this.request = (query, cb) => {
    const corr = generateUUID()

    store.set(corr, cb)

    ch.sendToQueue('rpc_queue', Buffer.from(query.toString()), { correlationId: corr, replyTo: q.queue })
  }

}

function generateUUID() {
  return Math.random().toString() + Math.random().toString() + Math.random().toString()
}

if (cluster.isMaster) {
  for (let i = 0; i < cpus().length; i++) {
    cluster.fork()
  }
}
else {
  main().catch(console.error)
}

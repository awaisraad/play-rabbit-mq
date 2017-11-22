const amqp = require('amqplib')
const Exchange = require('./exchange')

if (process.argv.length === 2) {
  help()
  process.exit(-1)
}

const patterns = process.argv.slice(2)

async function main() {
  const connection = await amqp.connect('amqp://localhost')
  const ch = await connection.createChannel()

  await ch.assertExchange(Exchange.name, Exchange.type, { durable: false })

  const Q = await ch.assertQueue('', { exclusive: true })

  // bind queue to patterns
  for (let pattern of patterns) {
    await ch.bindQueue(Q.queue, Exchange.name, pattern)
  }

  ch.consume(Q.queue, msg => {
    console.log(msg.fields.routingKey, msg.content.toString())
  }, { noAck: true })
}

function help() {
  console.log('Usage', 'node publisher.js <key> ... <key>')
  console.log('Example:')
  console.log('node publisher.js \'error.*\' \'info.*\'')
}

main().catch(console.error)
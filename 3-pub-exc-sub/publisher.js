const amqp = require('amqplib')
const sleep = require('../sleep')

async function main() {
  const connection = await amqp.connect('amqp://localhost')
  const ch = await connection.createChannel()

  // 'fanout' exchange pushes messages to all its known/bind queues
  // We don't want the exchange to be durable
  ch.assertExchange('logs', 'fanout', { durable: false })

  setInterval(() => {
    const LOG_MESSAGE = getRandomLogMessage()

    // producer publishes log to `logs` exchange
    ch.publish('logs', '', Buffer.from(LOG_MESSAGE))
    console.log('Publish |', LOG_MESSAGE)
  }, 20)
}

function getRandomLogMessage() {
  const SAMPLE_LOGS = [
    'LOW_DISK_SPACE',
    'NETWORK_ERROR',
    'CLIENT_DISCONNECTED',
    'MISSING_AUTH',
    'INVALID_REQUEST'
  ]

  const index = Math.floor(Math.random() * SAMPLE_LOGS.length)

  return SAMPLE_LOGS[index]
}

main().catch(console.error)
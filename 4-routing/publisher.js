const amqp = require('amqplib')
const sleep = require('../sleep')
const Exchange = require('./exchange')

const SAMPLE_LOGS = {
  ERROR: [
    'IMAGE_CONVERTER_CRASHED',
    'EMAIL_SERVICE_CRASHED',
    'NO_MORE_DISK_SPACE',
    'DATABASE_SERVER_DOWN'
  ],
  INFO: [
    'QUERY_TIMEOUT',
    '100K_CLIENT_IN_5_MINUTES',
    'REGISTERED_NEW_USER'
  ],
  WARNING: [
    'LOW_DISK_SPACE',
    'HIGH_CPU_USAGE',
    'CONNECTION_TIMEOUT',
    'REQUEST_TIMEOUT'
  ]
}

async function main(interval = 1000) {
  const connection = await amqp.connect('amqp://localhost')
  const ch = await connection.createChannel()

  await ch.assertExchange(Exchange.name, Exchange.type, { durable: false })

  function publishLogToExchange() {
    const log = generateRandomLogMessage()

    console.log(log)

    const topic = log.type
    ch.publish(Exchange.name, topic, Buffer.from(log.message))
  }

  setInterval(publishLogToExchange, interval)

}

function generateRandomLogMessage() {

  const keys = Object.keys(SAMPLE_LOGS)
  const randomIndex = Math.floor(Math.random() * keys.length)

  const errorType = keys[randomIndex]
  const errors = SAMPLE_LOGS[errorType]

  return {
    type: errorType,
    message: errors[Math.floor(Math.random() * errors.length)]
  }
}

const interval = Number(process.argv[2])

main().catch(console.error)
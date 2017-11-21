const ampq = require('amqplib')
const sleep = require('./sleep')

// constants
const QUEUE_NAME = "J_RABBIT_MQ"

async function main() {
  const connection = await ampq.connect('amqp://localhost')
  const ch = await connection.createChannel();

  ch
    .consume(QUEUE_NAME, async  msg => {
      console.log(msg.content.toString())
    })
}

main().catch(console.error)
const ampq = require('amqplib')
const sleep = require('./sleep')

// constants
const QUEUE_NAME = "J_RABBIT_MQ"

async function main() {
  const connection = await ampq.connect('amqp://localhost')
  const ch = await connection.createChannel();

  // tell RMQ to not to give more than one message to a worker at a time
  ch.prefetch(1)

  ch
    .consume(QUEUE_NAME, async  msg => {
      console.log(msg.content.toString())
      await sleep(10 * 1000)

      ch.ack(msg)
    },
    { noAck: false })
}

main().catch(console.error)
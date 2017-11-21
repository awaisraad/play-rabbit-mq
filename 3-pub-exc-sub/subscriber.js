const amqp = require('amqplib')
const sleep = require('../sleep')
const LOGS_EXCHANGE = 'logs'

async function main() {
  const connection = await amqp.connect('amqp://localhost')
  const ch = await connection.createChannel();

  // re-creating exchange on the client side
  // create exchange in case it hasn't been created yet
  ch.assertExchange(LOGS_EXCHANGE, 'fanout', { durable: false })

  // create new queue with random name
  // exclusive to remove Q when the consumer dies
  const { queue } = await ch.assertQueue('', { exclusive: true })

  // bind queue with exchange
  await ch.bindQueue(queue, LOGS_EXCHANGE)

  ch
    .consume(queue, msg => {
      console.log("Received ", msg.content.toString())
    },
    {
      noAck: true
    })
}

main().catch(console.error)
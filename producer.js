const ampq = require('amqplib')
const sleep = require('./sleep')

// constants
const QUEUE_NAME = "J_RABBIT_MQ"

async function main() {
  const connection = await ampq.connect('amqp://localhost')
  const ch = await connection.createChannel();
  const message = `Hello Rabbit! -${Date.now()}`;

  // TODO: Make exchanges durable

  // make queue durable
  ch.assertQueue(QUEUE_NAME, { durable: true })

  ch.sendToQueue(QUEUE_NAME, Buffer.from(message), {
    persistent: true  // make messages persistence
  })

  console.log(`On: ${QUEUE_NAME} | Text: [ ${message} ] `)

  // wait 
  await sleep(100);

  await ch.close()
  await connection.close()
}

main().catch(console.error)
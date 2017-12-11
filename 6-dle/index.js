const amqp = require('amqplib')
const sleep = require('../sleep')

async function graveyard() {
  const connection = await amqp.connect('amqp://localhost')
  const ch = await connection.createChannel()

  await ch.assertExchange('graveyard', 'fanout', { durable: true })
  const Q = await ch.assertQueue('', { exclusive: true })

  await ch.bindQueue(Q.queue, 'graveyard', '')

  await ch.consume(Q.queue, msg => {
    console.log('graveyard', msg.content.toString())
    ch.ack(msg)
  })
}

async function consumer() {

  const connection = await amqp.connect('amqp://localhost')
  const ch = await connection.createChannel()

  await ch.assertExchange('test', 'direct')

  await ch.assertQueue('message', { deadLetterExchange: 'graveyard' })
  await ch.bindQueue('message', 'test', '')

  await ch.prefetch(1)
  await ch.consume('message', msg => {
    console.log('consumer', msg.content.toString())
  }, { noAck: false })

}

async function publisher() {
  const connection = await amqp.connect('amqp://localhost')
  const ch = await connection.createChannel()

  const message = 'This is a message'
  for (let i = 0; i < 10; i++) {
    await ch.publish('test', '', Buffer.from(`${message} #${i}#`), { expiration: 1000 })
    await sleep()
  }

  await ch.close()
  await connection.close()
  console.info('Publisher closed')
}

graveyard().then(consumer).then(publisher).catch(console.error)
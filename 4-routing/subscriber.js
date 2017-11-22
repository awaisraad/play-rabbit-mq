const amqp = require('amqplib')
const chalk = require('chalk')

const sleep = require('../sleep')
const Exchange = require('./exchange')

const topic = String(process.argv[2]).toUpperCase()
const priority = Number(process.argv[3])

async function main(topic, priority = 1) {
  const connection = await amqp.connect('amqp://localhost')
  const ch = await connection.createChannel()

  await ch.assertExchange(Exchange.name, Exchange.type, { durable: false })

  const Q = await ch.assertQueue(`${topic}.logs`, { durable: true })

  ch.bindQueue(Q.queue, Exchange.name, topic)

  // dont send me more than one a time
  ch.prefetch(1)

  ch
    .consume(Q.queue, async msg => {
      printColoredLog(msg.content.toString())

      //  pretend to do some work
      await sleep(priority * 1000)

      // notify that you're done
      ch.ack(msg)
    }, {
      ack: true,
      priority
    })
}

function printColoredLog(message) {
  switch (topic) {
    case 'ERROR': return console.log(chalk.red(message))
    case 'WARNING': return console.log(chalk.yellow(message))
    case 'INFO': return console.log(chalk.green(message))
    
    default: return console.log(chalk.grey(message))
  }
}

main(topic, priority).catch(console.error)
const amqp = require('amqplib')
const chalk = require('chalk')
const Exchange = require('./exchange')

const topic = String(process.argv[2]).toUpperCase()

async function main(topic) {
  const connection = await amqp.connect('amqp://localhost')
  const ch = await connection.createChannel()

  await ch.assertExchange(Exchange.name, Exchange.type, { durable: false })

  const Q = await ch.assertQueue('', { exclusive: true })

  ch.bindQueue(Q.queue, Exchange.name, topic)

  ch.consume(Q.queue, msg => printColoredLog(msg.content.toString()), { noAck: true })
}

function printColoredLog(message) {
  switch (topic) {
    case 'ERROR'  : return console.log(chalk.red(message))
    case 'WARNING': return console.log(chalk.yellow(message))
    case 'INFO'   : return console.log(chalk.green(message))

    default       : return console.log(chalk.grey(message))
  }
}

main(topic).catch(console.error)
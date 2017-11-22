const amqp = require('amqplib')
const Exchange = require('./exchange')

if (process.argv.length < 4) {
  help()
  process.exit(-1)
}

const branch = String(process.argv[2])
const message = String(process.argv[3])

async function main() {
  const connection = await amqp.connect('amqp://localhost')
  const ch = await connection.createChannel()

  await ch.assertExchange(Exchange.name, Exchange.type, { durable: false })

  await ch.publish(Exchange.name, `${branch}`, Buffer.from(message))

  await ch.close()
  await connection.close()
}

function help() {
  console.log('Usage:', 'node subscribe.js <topic> <message>')
  console.log('Example:')
  console.log('node subscribe.js \'error.heroku\' \'Connection Timeout\'')
}

main().catch(console.error)
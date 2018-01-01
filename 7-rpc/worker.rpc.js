const amqp = require('amqplib')

async function main() {
  /** @type {Connection}*/
  const connection = await amqp.connect('amqp://localhost')

  /** @type {Channel}*/
  const ch = await connection.createChannel()
  const q = 'rpc_queue'

  await ch.assertQueue(q, { exclusive: true });
  // await ch.prefetch(1)

  console.log(' [x] Awaiting RPC requests')
  await ch.consume(q, reply)

  /**
   * @param {Message} msg
   */
  async function reply(msg) {
    const n = parseInt(msg.content.toString())
    const r = n

    ch.ack(msg)

    // const ms = Math.floor(Math.random() * 10) * 1000
    // console.log('Calculated fin, now sleeping for', ms)
    // await sleep(ms)

    ch.sendToQueue(
      msg.properties.replyTo,
      new Buffer(r.toString()),
      { correlationId: msg.properties.correlationId }
    )
  }
}

async function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * @param {number} n
 */
function fibonacci(n) {
  if (n === 0 || n === 1) {
    return n
  }

  return fibonacci(n - 1) + fibonacci(n - 2)
}

main().catch(console.error)
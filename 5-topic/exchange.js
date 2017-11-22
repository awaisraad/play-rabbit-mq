const RMQ_EXCHANGE_TYPES = {
  topic: 'topic',
  direct: 'direct',
  fanout: 'fanout'
}

const RMQ_EXCHANGE = {
  name: 'topic.logs',
  type: RMQ_EXCHANGE_TYPES.topic
}

module.exports = RMQ_EXCHANGE
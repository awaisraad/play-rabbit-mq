
/**
 * 
 * @param {number} ms The number of milliseconds to sleep 
 */
async function sleep(ms = 1500) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = sleep;
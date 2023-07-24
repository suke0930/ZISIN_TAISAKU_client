async function wssendms(type, ms, ip) {
  return new Promise((resolve, reject) => {
    try {
      const WebSocket = require('ws');
      const ws = new WebSocket(ip);

      ws.on('open', () => {
        console.log('Connected to the server.');
        ws.send(JSON.stringify({ type: type, message: ms }))
        ws.close();
        return resolve();
      });
      ws.on('error', () => {
        reject("つながんねぇ！")
      })

    } catch (error) {
      return reject(error);
    }



  })
}
module.exports = {
  wssendms,
};


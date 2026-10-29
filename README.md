# cards-game-back

Small Node.js WebSocket relay for a multiplayer card game client.

The browser opens a WebSocket to this server and passes the target game server address (Base64), bot name and token in the `Sec-WebSocket-Protocol` header. The relay opens its own connection to the game server with those credentials and forwards messages in both directions, closing both sockets together. This keeps the browser from talking to the game server directly and works around its connection requirements.

## Stack

Node.js · Express · ws

## Run

```bash
npm install
PORT=8080 node index.js
```

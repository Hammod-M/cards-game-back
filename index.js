const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

app.use(express.json());

const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws, req) {
  console.log("Новый клиент подключился");

  let wsClient = null;

  ws.on("message", function incoming(message) {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(message);
    } else {
      console.error(
        "Невозможно отправить сообщение. Соединение с удаленным сервером закрыто."
      );
      ws.send(
        JSON.stringify({
          error:
            "Невозможно отправить сообщение. Соединение с удаленным сервером закрыто.",
        })
      );
    }
  });

  ws.on("close", function () {
    console.log("Клиент отключился");
    // Если соединение с клиентом закрыто, закрываем также соединение с удаленным сервером
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.close();
    }
  });

  const serverAddress = req.headers["sec-websocket-protocol"].split(",")[0];
  const botName = req.headers["sec-websocket-protocol"].split(",")[1];
  const botToken = req.headers["sec-websocket-protocol"].split(",")[2];

  // Декодирование Base64 в строку
  const decodedURL = Buffer.from(serverAddress, "base64").toString("utf-8");

  wsClient = new WebSocket(decodedURL, {
    headers: {
      "Sec-WebSocket-Protocol": `${botName}, ${botToken}`,
    },
  });

  wsClient.on("open", function () {
    ws.send("success");
    console.log("Соединение с удаленным сервером установлено");
  });

  wsClient.on("error", function (error) {
    console.error("Ошибка при подключении к удаленному серверу:", error);
    ws.send(
      JSON.stringify({ error: "Ошибка при подключении к удаленному серверу" })
    );
    //
  });

  wsClient.on("message", function (message) {
    const messageString = message.toString("utf-8");
    console.log("Получено сообщение от удаленного сервера:", messageString);
    // Отправляем сообщение клиенту в формате JSON
    ws.send(messageString);
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порте ${PORT}`);
});

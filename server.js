import http from "http";
import redis from "redis";
import express from "express";
import bodyParser from "body-parser";
import websocket from "websocket";
import serverRooms from "./serverRooms.js";

const WebSocketServer = websocket.server;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ httpServer: server });
const port = 9025;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let userId = 0;

wss.on("request", (req) => {
	
	userId++;

    let roomName = req.resource.split("/").pop();
    let connection = req.accept();

    serverRooms.onUserConnected(connection, roomName, userId);

    connection.on("message", function (message) {
        let msg = JSON.parse(message.utf8Data);
        switch (msg.type) {
            case "text":
                serverRooms.roomMessages(msg);
                break;
            case "join":
                serverRooms.joinRoom(msg);
                break;
            case "send-update":
                serverRooms.sendUpdate(msg);
                break;
            case "get_room_asset":
                // console.log(message.utf8Data)
                // TODO: get asset name from database
                // let assetMessage = new Message('room_asset', "assets/room1.png", userID)
                // connection.sendUTF(JSON.stringify(assetMessage))
                break;
            default:
                break;
        }
    });

    //connection.on('close', () => serverRooms.onUserDisconnected(connection))
});

server.listen(port, () => {
    console.log("Server Listening on port 9025");
});

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
const redisPrefix = 'ECDWYC3D'
const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: '6379'
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let userId = 0;

serverRooms.init();

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
            case "private":
                serverRooms.privateMessages(msg);
                break;
            case "join":
                serverRooms.joinRoom(msg);
                break;
            case "send-update":
                serverRooms.sendUpdate(msg);
                break;
            case "change-room":
                serverRooms.changeRooms(msg);
                break;
            case "get-users":
                serverRooms.getUsers(msg);
                break;
            case "send-invite":
                serverRooms.sendInvite(msg);
                break;
            default:
                break;
        }
    });

    connection.on('close', () => serverRooms.onUserDisconnected(connection))
});

app.post('/register', async (req, res) => {
    // Sanitize username (delete '.')
    req.body.username = req.body.username.replace(/\./g, '')
    // Open connection to DB
    await redisClient.connect()
    // Check if requested user is already registered
    const key = `${redisPrefix}.${req.body.username}`
    if (await redisClient.get(key) === null) {
        await redisClient.set(key, JSON.stringify(req.body))
        await redisClient.disconnect()
        res.send('<script>alert("User registered successfully :)"); window.location.href = "/node/9025/"</script>')
    }
    else {
        await redisClient.disconnect()
        res.send('<script>alert("User already registered :/"); window.location.href = "/node/9025/register.html"</script>')
    }
})

app.post('/login', async (req, res) => {
    // Sanitize username (delete '.')
    req.body.username = req.body.username.replace(/\./g, '')
    // Open connection to DB
    await redisClient.connect()
    // Get user's info
    const key = `${redisPrefix}.${req.body.username}`
    const userInfo = JSON.parse(await redisClient.get(key))
    // Close connection to DB
    await redisClient.disconnect()
    // Validate user's info
    const validUser = userInfo && (req.body.username === userInfo.username) && (req.body.password === userInfo.password)
    if (validUser) res.redirect(`music-studio.html?username=${userInfo.username}&roomname=${userInfo.room}`)
    else res.send('<script>alert("Credentials are incorrect :("); window.location.href = "/node/9025/"</script>')
})

server.listen(port, () => {
    console.log("Server Listening on port 9025");
});

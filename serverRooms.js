class Message {
    constructor(type, content, userName) {
        this.type = type;
        this.content = content;
        this.userName = userName;
    }
}
class Client {
    constructor(connection, id, roomName) {
        this.connection = connection;
        this.userId = id;
        this.room = roomName;
        this.userObject = null;
    }
}

class Room {
    constructor(room) {
        this.name = room;
        this.clientsConnected = [];
        this.url = null;
    }

    addClient(clientID) {
        this.clientsConnected.push(clientID);
    }

    removeClient(clientId) {
        let idx = this.clientsConnected.indexOf(clientId);
        this.clientsConnected.splice(idx, 1);
    }

    getUsersConnected() {
        let users = [];
        this.clientsConnected.forEach((c) => {
            let client = serverRooms.clientsById[c];
            users.push(client.userObject);
        });
        return users;
    }
}

const serverRooms = {
    roomsByName: {},
    clientsById: {},
    clients: [],

    init: function () {
        let newRoom = new Room("street");
        newRoom.url = "assets/street.png";
        this.addRoom(newRoom);
    },

    onUserConnected(connection, roomName, userId) {
        if (!this.roomsByName[roomName]) {
            let newRoom = new Room(roomName);
            // newRoom.url = 'assets/room1.png'
            this.addRoom(newRoom);
        }
        let newClient = new Client(connection, userId, roomName);
        this.addClient(newClient, roomName);

        // console.log(this.roomsByName);

        // send id to the user
        connection.sendUTF(JSON.stringify(new Message("id", userId)));
    },

    onUserDisconnected(connection) {
        let userId = null;
        this.clients.forEach((client) => {
            if (client.connection === connection) {
                userId = client.userId;
                let idx = this.clients.indexOf(client.connection);
                this.clients.splice(idx, 1);
            }
        });
        //pillar room , enviar a tothom de la room que ha marxat => borrar el user de World
        let usersInRoom =
            this.roomsByName[this.clientsById[userId].room].clientsConnected;

        usersInRoom.forEach((otherUser) => {
            let user = this.clientsById[otherUser];
            let deleteUserMDG = new Message(
                "delete_user",
                this.clientsById[userId].userObject.userName,
                ""
            );
            user.connection.sendUTF(JSON.stringify(deleteUserMDG));
        });

        if (this.clientsById[userId] && "room" in this.clientsById[userId])
            this.roomsByName[this.clientsById[userId].room].removeClient(
                userId
            );
        // let room = this.roomsByName[ this.clientsById[userId].room ]
        // room.removeClient(userId)
        delete this.clientsById[userId];
    },

    addRoom: function (room) {
        this.roomsByName[room.name] = room;
    },

    addClient: function (client, roomName) {
        let room = this.roomsByName[roomName];
        this.clientsById[client.userId] = client;
        this.clients.push(client);
        room.addClient(client.userId);
    },

    roomMessages: function (msg) {
        let userName = msg.userName;
        let userId = msg.userId;
        let content = msg.content;
        let roomName = this.clientsById[userId].room;
        let room = this.roomsByName[roomName];
        room.clientsConnected.forEach((client) => {
            if (client !== userId) {
                let clientToSend = this.clientsById[client];
                let sysMessage = new Message(msg.type, content, userName);
                clientToSend.connection.sendUTF(JSON.stringify(sysMessage));
            }
        });
    },

    joinRoom: async function (msg) {
        console.log(msg);
        let userName = msg.userName;
        let userId = msg.userId;
        let content = msg.content;
        let userClient = this.clientsById[userId];
        let roomName = userClient.room;
        let room = this.roomsByName[roomName];

        userClient.userObject = content;

        room.clientsConnected.forEach((client) => {
            let clientToSend = this.clientsById[client];
            if (client !== userId) {
                let othersMessage = new Message(
                    msg.type,
                    userClient.userObject,
                    userName
                );
                clientToSend.connection.sendUTF(JSON.stringify(othersMessage));
            } else {
                let usersConnected = room.getUsersConnected();
                if (usersConnected.length > 1) {
                    let userMessage = new Message(
                        "create_users",
                        room.getUsersConnected(),
                        ""
                    );
                    clientToSend.connection.sendUTF(
                        JSON.stringify(userMessage)
                    );
                }
            }
        });

        /*
        await redisClient.connect();
        const key = `${redisPrefix}.${userName}`;
        const userInfo = JSON.parse(await redisClient.get(key));
        await redisClient.disconnect();
        const roomSkin = userInfo.room.toLowerCase().replace(/\s/g, "");
        const avatarSkin = userInfo.skin.toLowerCase().replace(/\s/g, "");

        if (!room.url) room.url = `assets/${roomSkin}.png`;
        let roomAssetMSG = new Message("room_asset", room.url, userName);
        userClient.connection.sendUTF(JSON.stringify(roomAssetMSG));

        let avatarAssetMSG = new Message(
            "user_skin",
            `assets/${avatarSkin}.png`,
            userName
        );
        userClient.connection.sendUTF(JSON.stringify(avatarAssetMSG));
        */
    },

    sendUpdate: function (msg) {
        let userName = msg.userName;
        let userId = msg.userId;
        let content = msg.content;

        let userClient = this.clientsById[userId];
        if (!userClient) return;
        let roomName = userClient.room;
        let room = this.roomsByName[roomName];

        userClient.userObject = content;

        room.clientsConnected.forEach((client) => {
            let clientToSend = this.clientsById[client];
            if (client !== userId) {
                let othersMessage = new Message(
                    "recieve-update",
                    userClient.userObject,
                    userName
                );
                clientToSend.connection.sendUTF(JSON.stringify(othersMessage));
            }
        });
    },
};

export default serverRooms;

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
        this.room = null;
        this.clientsConnected = [];
    }

    set roomObj(obj) {
        this.room = obj;
    }

    get roomObj() {
        return this.room;
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
        let walkAreas = {
            walkarea1: {
                pos: [-100, 0, -100],
                x: 200,
                y: 200,
            },
            drawExit1:{
                pos: [-115, 0, -15],
                x: 16,
                y: 30
            },
            drawExit2:{
                pos: [99, 0, -15],
                x: 10,
                y: 30
            },
            exits: {
                exit1: {
                    pos: [-115, 0, -15],
                    spawnPos: [-107, 0, 0],
                    x: 16,
                    y: 30,
                    to: null,
                    selectorPos: [-120, 10, 0],
                    selectorScale: [2, 20, 30],
                },
                exit2: {
                    pos: [99, 0, -15],
                    spawnPos: [99, 0, -15],
                    x: 10,
                    y: 30,
                    to: 'exitstudio',
                    selectorPos: [120, 10, 0],
                    selectorScale: [2, 20, 30],
                }
            },
        };

        let roomObj = {
            name: "plaza",
            asset: "plaza",
            scale: 1,
            walkAreas: walkAreas,
        };

        let newRoom = new Room("plaza");
        newRoom.roomObj = roomObj;
        this.addRoom(newRoom);
    },

    onUserConnected(connection, roomName, userId) {
        //if room does not exist on the server, create room

        if (!this.roomsByName[roomName]) {
            let newRoom = new Room(roomName);
            // newRoom.url = 'assets/room1.png'
            this.addRoom(newRoom);
        }

        //add client to room
        let newClient = new Client(connection, userId, roomName);
        this.addClient(newClient);

        // send id to the user
        connection.sendUTF(JSON.stringify(new Message("id", userId)));
    },

    onUserDisconnected(connection) {
        //retireve id from disconnected user and delete client from room and server
        let userId = null;
        this.clients.forEach((id) => {
            let client = this.clientsById[id];
            if (client.connection === connection) {
                userId = client.userId;
                this.removeClient(userId)
            }
        });

        //tell other connected users on the room that user disconnected
        let usersInRoom =
            this.roomsByName[this.clientsById[userId].room].clientsConnected;

        usersInRoom.forEach((otherUser) => {
            let user = this.clientsById[otherUser];
            let deleteUserMSG = new Message(
                "delete_user",
                this.clientsById[userId].userObject.userName,
                ""
            );
            user.connection.sendUTF(JSON.stringify(deleteUserMSG));
        });

        if (this.clientsById[userId] && "room" in this.clientsById[userId]) {
            this.roomsByName[this.clientsById[userId].room].removeClient(
                userId
            );
        }

        //delete client from server
        delete this.clientsById[userId];
    },

    addRoom: function (room) {
        this.roomsByName[room.name] = room;
    },

    addClient: function (client) {
        this.clientsById[client.userId] = client;
        this.clients.push(client.userId);
    },

    removeClient: function(clientID){
        let idx = this.clients.indexOf(clientID);
        this.clients.splice(idx, 1);
    },

    roomMessages: function (msg) {
        console.log(msg);
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

    privateMessages: function(msg){
        console.log(msg);
        let userName = msg.userName;
        let userId = msg.userId;
        let content = msg.content;
        let text = content.text;
        let target = content.target;

        this.clients.forEach((id)=>{
            let client = this.clientsById[id];
            let clientUserName = client.userObject.userName;
            if(clientUserName === target){
                let message = new Message('private', text, userName);
                client.connection.sendUTF(JSON.stringify(message));
            }
        });
    },

    changeRooms: function (msg) {
        let userId = msg.userId;
        let content = msg.content;
        let roomToLeave = content.from;
        let roomToJoin = content.to;

        roomToLeave = this.roomsByName[roomToLeave];
        roomToJoin = this.roomsByName[roomToJoin];
        //remove client from current room
        roomToLeave.removeClient(userId);

        //update client info about room
        let userClient = this.clientsById[userId];
        userClient.room = roomToJoin.name;

        msg.content = userClient.userObject;

        //tell client to load new room
        userClient.connection.send(
            JSON.stringify(new Message("reload-room", roomToJoin.roomObj, ""))
        );

        //add client to new room
        this.joinRoom(msg);
        
        roomToLeave.clientsConnected.forEach((clientId)=>{
            let client = serverRooms.clientsById[clientId];
            let deleteUserMSG = new Message(
                "delete_user",
                this.clientsById[userId].userObject.userName,
                ""
            );
            client.connection.sendUTF(JSON.stringify(deleteUserMSG));
        });
    },

    joinRoom: async function (msg) {
        let userName = msg.userName;
        let userId = msg.userId;
        let content = msg.content;
        let userClient = this.clientsById[userId];
        let roomName = userClient.room;
        let room = this.roomsByName[roomName];

        if (msg.content.room) {
            room.roomObj = msg.content.room;
        }

        
        if (content.user) {
            userClient.userObject = content.user;
        }

        let usersConnected = room.getUsersConnected();

        if (usersConnected.length >= 1) {
            let userMessage = new Message(
                "create_users",
                room.getUsersConnected(),
                ""
            );
            userClient.connection.sendUTF(JSON.stringify(userMessage));
        }

        room.addClient(userId);

        room.clientsConnected.forEach((clientId) => {
            let client = serverRooms.clientsById[clientId];
            if (client.userId !== userId) {
                //send to other users on the room that a user has connected.
                let othersMessage = new Message(
                    "join",
                    userClient.userObject,
                    userName
                );
                client.connection.sendUTF(JSON.stringify(othersMessage));
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

        //userClient.userObject = content;

        room.clientsConnected.forEach((client) => {
            let clientToSend = this.clientsById[client];
            if (client !== userId) {
                let othersMessage = new Message(
                    "recieve-update",
                    content,
                    userName
                );
                clientToSend.connection.sendUTF(JSON.stringify(othersMessage));
            }
        });
    },

    getUsers: function(msg){
        let userId = msg.userId;
        let client = serverRooms.clientsById[userId];

        let userNames = [];
        this.clients.forEach(clientId =>{
            if(clientId !== userId){
                userNames.push(this.clientsById[clientId].userObject.userName);
            }
        })

        let users = new Message("receive-users",userNames,'sys');
        client.connection.sendUTF(JSON.stringify(users));

    }
};

export default serverRooms;

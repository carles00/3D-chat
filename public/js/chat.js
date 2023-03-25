let DEBUG = true;
let url = DEBUG
    ? "ws://localhost:9025/ws"
    : "wss://ecv-etic.upf.edu/node/9025/ws";

class Message {
    constructor(type, content, userName, id) {
        this.type = type;
        this.content = content;
        this.userName = userName;
        this.userId = id;
    }

    toJson() {
        return {
            type: this.type,
            content: this.content,
            userName: this.userName,
            userId: this.userId,
        };
    }
}

const Chat = {
    input: null,
    client: null,
    userName: null,
    roomName: null,
    userId: null,

    init: function (userName, roomName, chatInput) {
        this.userName = userName;
        this.roomName = roomName;
        this.client = new SocketClient(url);
        this.userId = this.client.connect(roomName, userName);
        this.input = chatInput;

        this.client.onId = this.onId.bind(this);
        this.client.onRecieveMessage = this.processMessageFromServer.bind(this);
    },

    onId: function (id) {
        this.userId = id;
        // once we have an id join the room
        let joinMessage = new Message(
            "join",
            {user: World.usersByName[World.myUser], room: World.roomsByName[World.currentRoom]},
            this.userName,
            this.userId
        );
        this.client.sendMessage(JSON.stringify(joinMessage));
    },

    changeRoom(from, to) {
        let content = {
            from: from,
            to: to
        }
        let changeRoomMSG = new Message(
            "change-room",
            content,
            this.userName,
            this.userId
        );
        this.client.sendMessage(JSON.stringify(changeRoomMSG));
    },

    sendUpdate() {
        if (this.userId) {
            let myUser = World.usersByName[World.myUser];
            let update = {
                pos: myUser.position,
                rot: myUser.rotation,
                anim: myUser.animation,
                dir: myUser.direction,
            };

            let message = new Message(
                "send-update",
                update,
                this.userName,
                this.userId
            );
            this.client.sendMessage(JSON.stringify(message));
        }
    },

    sendMessage: function () {
        if (this.input.value === "") return;
        let messageToSend = new Message(
            "text",
            this.input.value,
            this.userName,
            this.userId
        );
        World.sendMessage(messageToSend.content);
        this.client.sendMessage(JSON.stringify(messageToSend));
        this.input.value = "";
    },

    processMessageFromServer: function (message) {
        if(message.type !== "recieve-update"){
            console.log(message)
        }
        switch (message.type) {
            case "text":

            case "join":
                this.onJoin(message.content);
                break;
            case "create_users":
                this.onCreateUsers(message.content);
                break;
            case "recieve-update":
                this.onRecieveUserUpdate(message.userName, message.content);
                break;
            case "reload-room":
                this.onReloadRoom(message.content);
                break;
            case "user_skin":

            case "delete_user":
                this.onDeleteUser(message.content);
                break;
            default:
                break;
        }
    },

    onJoin: function (content) {
        World.createUser(
            content.userName,
            content.avatar,
            content.scale,
            content.position,
            World.currentRoom
        );

        View.addNode(World.usersByName[content.userName]);
    },

    onCreateUsers: function (content) {
        content.forEach((user) => {
            if (user.userName !== this.userName) {
                World.createUser(
                    user.userName,
                    user.avatar,
                    user.scale,
                    user.position,
                    World.currentRoom
                );
                View.addNode(World.usersByName[user.userName]);
            }
        });
    },

    onRecieveUserUpdate: function (userName, content) {
        World.updateUser(userName, content);
    },

    recieveMessage: function (userName, content) {
        World.recieveMessage(userName, content);
    },

    onRecieveRoomAsset: function (content) {
        let roomAsset = content;
        World.setRoomAsset(this.userName, roomAsset);
    },

    onUserSkin: function (content) {
        World.setUserSkin(this.userName, content);
    },

    onDeleteUser: function (content) {
        let userToDelete = World.usersByName[content];
        World.deleteUser(content);
        View.removeNode(userToDelete);
    },

    onReloadRoom: function(content){
        World.loadRoom(content);
    }
};

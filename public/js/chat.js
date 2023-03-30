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
    client: null,
    userName: null,
    roomName: null,
    userId: null,

    init: function (userName, roomName) {
        this.userName = userName;
        this.roomName = roomName;
        this.client = new SocketClient(url);
        this.userId = this.client.connect(roomName, userName);

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
        let getUsers = new Message('get-users','',this.userName, this.userId)

        this.client.sendMessage(JSON.stringify(joinMessage));
        this.client.sendMessage(JSON.stringify(getUsers));
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

    sendMessage: function (text, userName=null) {
        let type = 'text';
        let content = text
        if(userName){
            type = 'private'
            content = {
                text: text,
                target: userName
            }
        }
        
        let messageToSend = new Message(
            type,
            content,
            this.userName,
            this.userId
        );
        //World.sendMessage(messageToSend.content);
        this.client.sendMessage(JSON.stringify(messageToSend));
    },

    processMessageFromServer: function (message) {
        if(DEBUG && message.type !== "recieve-update"){
            console.log(message)
        }
        switch (message.type) {
            case "text":
                break;
            case 'private':
                this.onReceivePrivateMessage(message.userName, message.content);
                break;
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
                break;
            case "delete_user":
                this.onDeleteUser(message.content, message.userName);
                break;
            case "receive-users":
                message.content.forEach((user) =>{
                    messagingController.addConnectedUser(user);   
                })
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
        messagingController.addConnectedUser(content.userName);
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

    onReceivePrivateMessage: function(userName, content){
        messagingController.addMessageToBoard(content, World.myUser, userName);
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

    onDeleteUser: function (content, userName) {
        let userToDelete = World.usersByName[content];
        World.deleteUser(content);
        View.removeNode(userToDelete);
        //if the message is sent by the system that means the user disconected 
        if(userName === "sys"){
            messagingController.removeConnectedUser(content);
        }
        
    },

    onReloadRoom: function(content){
        World.loadRoom(content);
    }
};

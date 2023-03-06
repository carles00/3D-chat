class SocketClient {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.room = null;
        this.onConnect = null;
        this.onMessage = null;
        this.onJoin = null;
        this.onCreateUsers = null;
        this.onRecieveUserUpdate = null;
        this.onRecieveRoomAsset = null;
        this.onUserSkin = null;
        this.onDeleteUser = null;
    }

    connect(room, userName) {
        let urlString = url + "/" + room;
        this.socket = new WebSocket(urlString);
        this.socket.onopen = () => {
            console.log("Connected");
        };
        this.socket.onmessage = (message) =>
            this.processMessageFromServer(JSON.parse(message.data));
    }

    disconnect() {
        this.socket.close();
    }

    waitForConnection(callback, interval) {
        if (this.socket.readyState === 1) callback();
        else {
            const that = this;
            setTimeout(() => {
                that.waitForConnection(callback, interval);
            }, interval);
        }
    }

    sendMessage(message, callback) {
        this.waitForConnection(() => {
            this.socket.send(message);
            if (typeof callback !== "undefined") callback();
        }, 1000);
    }

    processMessageFromServer(message) {
        switch (message.type) {
            case "id":
                if (this.onId) this.onId(message.content);
                break;
            case "text":
                if (this.onMessage)
                    this.onMessage(message.userName, message.content);
                break;
            case "join":
                if (this.onJoin) this.onJoin(message.content);
                break;
            case "create_users":
                if (this.onCreateUsers) this.onCreateUsers(message.content);
                break;
            case "recieve-update":
                if (this.onRecieveUserUpdate)
                    this.onRecieveUserUpdate(message.userName, message.content);
                break;
            case "room_asset":
                if (this.onRecieveRoomAsset) {
                    this.onRecieveRoomAsset(message.content);
                }
                break;
            case "user_skin":
                if (this.onUserSkin) {
                    this.onUserSkin(message.content);
                }
                break;
            case "delete_user":
                if (this.onDeleteUser) this.onDeleteUser(message.content);
                break;
            default:
                break;
        }
    }
}

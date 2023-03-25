class SocketClient {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.room = null;
        this.userName = null;
        this.onConnect = null;
        this.onRecieveMessage = null;
        this.onId = null;
        this.onDisconnect = null;
    }

    connect(room, userName) {
        let urlString = url + "/" + room;
        this.socket = new WebSocket(urlString);
        this.userName = userName;
        this.socket.onopen = () => {
            console.log("Connected");
        };
        this.socket.onmessage = (message) =>{
            this.recieveMessage(JSON.parse(message.data));
        };
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

    recieveMessage(message) {
        if(message.type === "id"){
            if(this.onId){
                this.onId(message.content);
            }
        }else if(this.onRecieveMessage){
            
            this.onRecieveMessage(message);
        }
    }
}

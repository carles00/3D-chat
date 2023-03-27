Element.prototype.removeAllChilds = function(){
    while(this.firstChild) this.removeChild(this.lastChild);
}


let messagingController = {
    userSelected: null,

    usersSpace: null,
    messageUser: null,
    messageBoard: null,
    inputText: null,

    messages: [],

    init: function () {
        //get dom objects
        this.usersSpace = document.getElementById('users-space');
        this.messageUser = document.getElementById('message-user');
        this.messageBoard = document.getElementById('message-board');
        this.inputText =  document.getElementById('user-input');
        this.inputText.addEventListener('keyup',(e)=>{
            if(e.key === 'Enter'){
                messagingController.sendMessage();
            }
        });

    },

    sendMessage: function(){
        if(this.inputText.value && this.userSelected){
            Chat.sendMessage(this.inputText.value, this.userSelected);
            this.inputText.value = '';
        }
    },

    addConnectedUser: function (userName) {
        //add names to connected list
        let newUser = document.createElement('p');
        newUser.innerHTML = userName;
        newUser.addEventListener('click', function(){
            messagingController.userSelected = this.innerHTML;
    
            //messagingController.messageUser.innerHTML = '';
            messagingController.messageUser.removeAllChilds();
            let userName = document.createElement('p') 
            userName.innerHTML= this.innerHTML;
            messagingController.messageUser.appendChild(userName);
        });
        this.usersSpace.appendChild(newUser);
    },

    removeConnectedUser: function(userName){
        //remove user from connected list
    },

    addMessageToBoard: function(text, userName){
        //add message to board
        let msg = {
            author: userName,
            text: text,
            to: World.myUser
        }

        this.messages.push(msg);
        this.reloadBord();
    },

    reloadBord: function(){
        this.messageBoard.removeAllChilds();
       
    }
};

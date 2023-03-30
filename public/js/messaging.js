//helper to remove all childs of element
Element.prototype.removeAllChilds = function () {
    while (this.firstChild) this.removeChild(this.lastChild);
};

//helper to remove child of element by a given innerHtml
Element.prototype.removeChildByInnerText = function (text) {
    for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].innerHTML === text) {
            this.children[i].remove();
        }
    }
};

Element.prototype.childWithSameInnerText = function(text){
    let existing = false;
    for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].innerHTML === text) {
            existing = true
        }
    }
    return existing;
}

let messagingController = {
    userSelected: null,

    usersSpace: null,
    messageUser: null,
    messageBoard: null,
    messageBoardHeader: null,
    inputText: null,

    messages: [],
    showingInvite: false,

    init: function () {
        //get dom objects
        this.usersSpace = document.getElementById("users-space");
        this.messageUser = document.getElementById("message-user");
        this.messageBoard = document.getElementById("message-board");
        this.messageBoardHeader = document.getElementById('message-board-header');
        this.inputText = document.getElementById("user-input");
        this.inputText.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                messagingController.sendMessage();
            }
        });
    },

    sendMessage: function () {
        if (this.inputText.value && this.userSelected) {
            Chat.sendMessage(this.inputText.value, this.userSelected);
            this.addMessageToBoard(
                this.inputText.value,
                this.userSelected,
                World.myUser
            );
            this.inputText.value = "";
        }
    },

    addConnectedUser: function (userName) {
        if(this.usersSpace.childWithSameInnerText(userName)) return;
        //add names to connected list
        let newUser = document.createElement("div");
        newUser.className = "connected-user";
        newUser.innerHTML = userName;
        newUser.addEventListener("click", function () {
            //change selected user on click on user name
            messagingController.userSelected = this.innerHTML;
            //change chat title to user selected
            messagingController.messageUser.removeAllChilds();
            let userName = document.createElement("p");
            userName.innerHTML = this.innerHTML;
            messagingController.messageUser.appendChild(userName);
            //reload bord to show conversation with selected user
            messagingController.reloadBord();
        });
        this.usersSpace.appendChild(newUser);
    },

    removeConnectedUser: function (userName) {
        //remove user from connected list
        this.usersSpace.removeChildByInnerText(userName);
    },

    addMessageToBoard: function (text, to, from) {
        //add message to board
        let msg = {
            author: from,
            text: text,
            to: to,
        };

        this.messages.push(msg);
        this.reloadBord();
    },

    reloadBord: function () {
        this.messageBoard.removeAllChilds();
        this.messages.forEach((message) => {
            //only append messages from selected conversation
            if (
                this.userSelected === message.author ||
                this.userSelected === message.to
            ) {
                let messageDiv = document.createElement("div");
                messageDiv.className =
                    message.author === this.userSelected
                        ? "message contact-message"
                        : "message user-message";

                let textDiv = document.createElement("p");
                textDiv.className = "message-content";
                textDiv.innerHTML = message.text;

                messageDiv.appendChild(textDiv);
                this.messageBoard.prepend(messageDiv);
                //auto scroll
                this.messageBoard.scrollTop = this.messageBoard.scrollHeight;
            }
        });
    },

    toggleInviteToRoom: function(){
        
        if(this.showingInvite){
            document.getElementById('invite-button').remove();
        }else{
            let inviteButton = document.createElement('div');
            inviteButton.id = 'invite-button';
            inviteButton.innerHTML = 'Invite to Studio';
            inviteButton.addEventListener('click',()=>{
                if(this.userSelected){
                    Chat.sendInvite(this.userSelected);
                }
                
            });

            this.messageBoardHeader.appendChild(inviteButton);
        }
        this.showingInvite = !this.showingInvite;
    }
};

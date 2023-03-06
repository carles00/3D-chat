const urlString = window.location.search

const params = new URLSearchParams(urlString)

const USERNAME = params.get('username')
const ROOMNAME = params.get('roomname')


function init() {
    const userInput = document.getElementById('user-input');
    //initialize context
    let context = GL.create({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    //init chat
    Chat.init(USERNAME, ROOMNAME, userInput);

    //create  myUser
    let myUser = World.createUser(USERNAME, "girl", 0.3, [-40, 0, 0]);
    World.myUser = myUser.userName;
    //create room
    let room = new Room("test");
    room.addUser(myUser.userName);
    World.addRoom(room);
    World.currentRoom = room.roomName;

    /*create other user
    let otherUser = World.createUser("other", "girl", 0.25, [-20, 0, 0]);
    room.addUser(otherUser.userName);
    */
    //init
    View.init(context);

    //add elements to the scene
    View.addNode(myUser);
    //View.addNode(otherUser);
    View.addNode(room);

    View.start();
}

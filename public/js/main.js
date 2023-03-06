function init(){
    //initialize context
    let context = GL.create({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    //create user
    let myUser = World.createUser('girl', 'girl', 0.3, [-40,0,0]);
    World.myUser = myUser.userName;
    //create room
    let room = new Room('test');
    room.addUser(myUser.userName);
    World.addRoom(room);
    World.currentRoom = room.roomName;
    //init
    View.init(context);

    //add elements to the scene
    View.addNode(myUser);
    View.addNode(room);

    View.start();
}
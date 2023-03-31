const urlString = window.location.search

const params = new URLSearchParams(urlString)

// URL Parameters
const USERNAME = params.get('username')
const ROOMNAME = params.get('roomname')
const SKIN = params.get('skin')
// TODO: check if they match the values in the DDBB
fetch(`${window.location.origin}/check_user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: USERNAME,
        roomname: ROOMNAME,
        skin: SKIN
    })
})
.then(res => {
    if (res.status === 404) window.location.replace(`${window.location.origin}/`)
    else console.log(res.status)
})
.catch(err => console.warn(err))


let canvas = null


function init() {
    messagingController.init();

    const userInput = document.getElementById('user-input');
    

    //initialize context
    let context = GL.create({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    //create  myUser
    let myUser = World.createUser(USERNAME, SKIN, 0.1, [0, 0, 0]);
    World.myUser = myUser.userName;

    //create room
    let walkAreas = {
        walkArea1: {
            pos: [-35, 0, -28],
            x: 61,
            y: 56
        },
        walkArea2: {
            pos: [-71, 0, -66],
            x: 38,
            y: 94
        },
        drawExit:{
            pos: [-60, 0, -66],
            x: 16,
            y: 10
        },
        exits: {
            exit1: {
                pos: [-60, 0, -66],
                spawnPos: [-52, 0, -59],
                x: 16,
                y: 10,
                to: 'exitplaza',
                selectorPos: [-52, 10, -68],
                selectorScale: [16, 20, 2],
            }
            
        }
    }


    let room = new Room(ROOMNAME,'room',1, walkAreas);
    room.addUser(myUser.userName);
    World.addRoom(room);
    World.currentRoom = room.roomName;
    World.myRoom = room.roomName;

    //init chat
    Chat.init(USERNAME, ROOMNAME, userInput);

    //init Render
    View.init(context);

    //add elements to the scene
    View.addNode(myUser);
    //View.addNode(otherUser);
    View.addNode(room);

    //start renderer
    View.start();
}

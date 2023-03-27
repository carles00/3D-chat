const urlString = window.location.search

const params = new URLSearchParams(urlString)

const USERNAME = params.get('username')
const ROOMNAME = params.get('roomname')

let canvas = null


function init() {
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keyup',(e)=>{
        if(e.key === 'Enter'){
            Chat.sendMessage()
        }
    });

    //initialize context
    let context = GL.create({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    //create  myUser
    let myUser = World.createUser(USERNAME, "girl", 0.1, [0, 0, 0]);
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

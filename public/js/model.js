let World = {
    usersByName: {},
    roomsByName: {},
    myUser: null,
    currentRoom: null,
    myRoom: null,
    invitedTo: null,

    createUser: function (userName, avatar, scale, position, room = null) {
        let newUser = new User(userName, avatar, scale, position);
        this.usersByName[userName] = newUser;
        if (room) {
            this.roomsByName[room].addUser(userName);
        }
        return newUser;
    },

    addRoom: function (room) {
        this.roomsByName[room.roomName] = room;
    },

    deleteUser: function (userName) {
        this.roomsByName[this.currentRoom].deleteUser(userName);
        delete this.usersByName[userName];
    },

    updateUser: function (userName, content) {
        let userToUpdate = this.usersByName[userName];
        if (userToUpdate) {
            userToUpdate.updateUser(content);
        }
    },

    loadRoom(roomObj) {
        //remove old room
        let leavingRoom = this.roomsByName[this.currentRoom];

        leavingRoom.deleteUser(this.myUser);

        leavingRoom.users.forEach((user) => {
            View.removeNode(World.usersByName[user]);
        });
        View.removeNode(leavingRoom);

        //set exit to old room
        this.setExitOfNewRoom(roomObj);

        //create new room
        let joiningRoom = new Room(
            roomObj.name,
            roomObj.asset,
            roomObj.scale,
            roomObj.walkAreas
        );

        this.tpPlayerToEntrance(joiningRoom);

        joiningRoom.addUser(this.myUser);

        this.addRoom(joiningRoom);
        this.currentRoom = joiningRoom.roomName;

        //show invite button when on studio room
        if(this.currentRoom.substr(0,6) === 'studio'){
            messagingController.toggleInviteToRoom();
        }

        View.addNode(joiningRoom);
    },

    setExitOfNewRoom: function(roomObj){
        //the exit with to === null will be the one to return
        let roomExits = Object.entries(roomObj.walkAreas.exits);
        roomExits.forEach((exit)=>{
            if(!exit[1].to){
                exit[1].to = 'exit'+this.myRoom;
            }
        });
    },

    tpPlayerToEntrance: function(room){
        room.exits.forEach((exit)=>{
            if('exit'+this.currentRoom === exit.to || this.currentRoom.substr(0,6) === 'studio' && exit.to.substr(4,9)==='studio'){
                this.usersByName[this.myUser].position = exit.pos;
                
            }
        });
    },

    setStudioExitToInvite: function(room){
        this.invitedTo = room;
    },

    setUserSkin: (username, skin) => {
        if (username === World.myUser && skin === World.usersByName[username].avatar) return
        else window.location.replace(`${window.location.origin}/`)
    }
};

class User {
    userName;
    avatar;
    avatarScale;
    material;
    character;
    animations = {};
    animation;
    parentNode;
    characterSelector;
    direction = 1;

    constructor(username, avatar, scale, position) {
        this.userName = username;
        this.avatar = avatar;
        this.avatarScale = scale;
        this.material = new RD.Material({
            textures: {
                color: avatar + "/" + avatar + ".png",
            },
        });

        this.material.register(avatar);

        this.character = new RD.SceneNode({
            name: username,
            scaling: scale,
            mesh: avatar + "/" + avatar + ".wbin",
            material: avatar,
        });

        this.parentNode = new RD.SceneNode({
            position: position,
        });

        this.parentNode.addChild(this.character);
        this.character.skeleton = new RD.Skeleton();

        this.addAnimation("idle");
        this.addAnimation("walking");
        this.addAnimation("dance");

        this.animation = "idle";

        this.characterSelector = new RD.SceneNode({
            position: [0, 20, 0],
            mesh: "cube",
            material: "girl",
            scaling: [8, 20, 8],
            name: "player"+username,
            layers: 0b1000,
        });

        this.parentNode.addChild(this.characterSelector);
    }

    get currentAnimation() {
        return this.animations[this.animation];
    }

    get sceneNode() {
        return this.parentNode;
    }

    get userCharacter() {
        return this.character;
    }

    get position() {
        return this.parentNode.position;
    }

    get rotation() {
        return this.parentNode.rotation;
    }

    set setAnimation(anim) {
        this.animation = anim;
    }

    set position(pos) {
        this.parentNode.position = new Float32Array(pos);
    }

    set rotation(rot) {
        this.parentNode.rotation = rot;
    }

    set setDirection(dir) {
        this.direction = dir;
    }

    addAnimation(animation) {
        this.loadAnimation(
            animation,
            `data/${this.avatar}/${animation}.skanim`
        );
    }

    loadAnimation(name, url) {
        var anim = (this.animations[name] = new RD.SkeletalAnimation());
        anim.load(url);
        return anim;
    }

    updateAnimation(t) {
        this.currentAnimation.assignTime(t * 0.001 * this.direction);
        this.userCharacter.skeleton.copyFrom(this.currentAnimation.skeleton);
    }

    updateUser(content) {
        this.position = content.pos;
        this.rotation = content.rot;
        this.animation = content.anim;
        this.direction = content.dir;
    }

    toJSON() {
        return {
            userName: this.userName,
            avatar: this.avatar,
            scale: this.avatarScale,
            position: this.parentNode.position,
        };
    }
}

class Room {
    roomName = null;
    assetName = null;
    scale = null;
    walkareasObj = null;

    roomNode = null;
    walkarea = null;
    selector = null;
    exits = [];
    users = [];

    constructor(name, assetName, scale, walkAreas) {
        this.roomName = name;
        this.assetName = assetName;
        this.scale = scale;
        this.walkareasObj = walkAreas;

        this.roomNode = new RD.SceneNode({
            name: name,
            scaling: scale,
            position: [0, -0.01, 0],
        });

        this.walkarea = new WalkArea();
        let areas = Object.entries(walkAreas);
        areas.forEach((area) => {
            let walkAreaPos = area[1].pos;
            let walkAreaX = area[1].x;
            let walkAreaY = area[1].y;
            if (area[0] !== "exits") {
                this.walkarea.addRect(walkAreaPos, walkAreaX, walkAreaY);
            } else {
                let exitsObj = Object.entries(area[1]);
                exitsObj.forEach((exitObj) => {
                    exitObj = exitObj[1];

                    let exitWA = new WalkArea();
                    exitWA.addRect(exitObj.pos, exitObj.x, exitObj.y);

                    let selector = new RD.SceneNode({
                        position: exitObj.selectorPos,
                        mesh: "cube",
                        material: "girl",
                        scaling: exitObj.selectorScale,
                        name: exitObj.to,
                        layers: 0b1000,
                    });

                    let exit = {
                        walkArea: exitWA,
                        to: exitObj.to,
                        pos: exitObj.spawnPos,
                        selector: selector,
                    };
                    this.roomNode.addChild(selector);

                    this.exits.push(exit);
                });
                /*
                
                */
            }
        });

        this.roomNode.loadGLTF(`data/${assetName}.glb`);
    }

    addUser(userName) {
        this.users.push(userName);
    }

    deleteUser(userName) {
        let idx = this.users.indexOf(userName);
        this.users.splice(idx, 1);
    }

    get exits() {
        return this.exits;
    }

    get sceneNode() {
        return this.roomNode;
    }

    toJSON() {
        return {
            name: this.roomName,
            asset: this.assetName,
            scale: this.scale,
            walkAreas: this.walkareasObj,
        };
    }
}

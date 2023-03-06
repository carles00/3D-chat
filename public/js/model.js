let World = {
    usersByName: {},
    roomsByName: {},
    myUser: null,
    currentRoom: null,

    createUser: function(userName, avatar, scale, position){
        let newUser = new User(userName, avatar, scale, position);
        this.usersByName[userName] = newUser;
        return newUser;
    },

    addRoom: function(room){
        this.roomsByName[room.roomName] = room;
    }
}

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

    constructor(username, avatar, scale, position) {
        this.userName = username;
        this.avatar = avatar;
        this.avatarScale = scale;
        this.material = new RD.Material({
            textures: {
                color: avatar + "/" + avatar + ".png"}
        });

        this.material.register(avatar);

        this.character = new RD.SceneNode({
            scaling: scale,
            mesh: avatar + "/" + avatar +".wbin",
            material: avatar
        });

        this.parentNode = new RD.SceneNode({
            position: position
        });

        this.parentNode.addChild(this.character);
        this.character.skeleton = new RD.Skeleton();

        this.addAnimation("idle");
        this.addAnimation("walking");
        this.addAnimation('dance');

        this.animation = this.animations['idle'];

        this.characterSelector = new RD.SceneNode({
            position: [0, 20, 0],
            mesh: "cube",
            material: "girl",
            scaling: [8, 20, 8],
            name: "girlSelector",
            layers: 0b1000,
        });

        this.parentNode.addChild(this.characterSelector);

    }

    get currentAnimation() {
        return this.animation;
    }

    get sceneNode(){
        return this.parentNode;
    }

    get userCharacter(){
        return this.character;
    }

    set setAnimation(anim){
        this.animation = this.animations[anim];
    }

    addAnimation(animation) {
        this.loadAnimation(animation, `data/${this.avatar}/${animation}.skanim`);
    }

    loadAnimation(name, url) {
        var anim = (this.animations[name] = new RD.SkeletalAnimation());
        anim.load(url);
        return anim;
    }
}

class Room {
    roomName;
    roomNode;
    walkarea;
    users = [];
    constructor(name) {
        this.roomName = name;

        this.walkarea = new WalkArea();
        this.walkarea.addRect([-50, 0, -30], 80, 50);
        this.walkarea.addRect([-90, 0, -10], 80, 20);
        this.walkarea.addRect([-110, 0, -30], 40, 50);

        this.roomNode = new RD.SceneNode({ scaling: 40, position: [0, -0.01, 0] });
        this.roomNode.loadGLTF("data/room.gltf");
    }

    addUser(userName){
        this.users.push(userName);
    }

    get sceneNode(){
        return this.roomNode;
    }
}

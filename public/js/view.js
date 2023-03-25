var VIEW_SELECTORS = false;

var View = {
    context: null,
    scene: null,
    renderer: null,
    camera: null,
    gizmo: null,
    bgColor: null,

    init: function (context) {
        this.context = context;

        this.renderer = new RD.Renderer(this.context);
        this.renderer.setDataFolder("data");
        this.renderer.autoload_assets = true;

        document.body.appendChild(this.renderer.canvas);

        this.scene = new RD.Scene();

        this.camera = new RD.Camera();
        this.camera.perspective(
            60,
            gl.canvas.width / gl.canvas.height,
            0.1,
            1000
        );
        this.camera.lookAt([0, 40, 100], [0, 20, 0], [0, 1, 0]);
        this.bgColor = [0.1, 0.1, 0.1];

        this.gizmo = new RD.Gizmo();
        this.gizmo.mode = RD.Gizmo.ALL;

        this.context.ondraw = () => {
            gl.canvas.width = document.body.offsetWidth;
            gl.canvas.height = document.body.offsetHeight;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            let myUser = World.usersByName[World.myUser];

            let t = getTime();
            var campos = myUser.sceneNode.localToGlobal([0,15,0]);
            let camtarget = myUser.sceneNode.localToGlobal([0,20,70]);

            this.camera.lookAt(campos, camtarget, [0, 1, 0]);

            //clear
            this.renderer.clear(this.bgColor);
            //render scene
            let layerMask = VIEW_SELECTORS ? 0b1000 : 0b11;
            this.renderer.render(this.scene, this.camera, null, layerMask);
            let room = World.roomsByName[World.currentRoom];
            if(room.walkarea){
                let vertices = room.walkarea.getVertices();
                this.renderer.renderPoints(
                    vertices,
                    null,
                    this.camera,
                    null,
                    null,
                    null,
                    gl.LINES
                );
            }
            
            room.users.forEach(userName => {
                World.usersByName[userName].updateAnimation(t);
            });
            //gizmo.setTargets([monkey]);
            //renderer.render( scene, camera, [gizmo] ); //render gizmo on top
        };

        this.context.onupdate = function (dt) {
            Controller.update(dt);
        };

        this.context.onmouse = (e) => {
            //gizmo.onMouse(e);
        };

        this.context.onmouseup = function (e) {
            Controller.mouseClick(e);
        };

        this.context.onmousemove = function (e) {
            Controller.mouseMove(e);
        };

        this.context.onmousewheel = function (e) {
            Controller.mouseWheel(e);
        };

        this.context.captureMouse(true);
        this.context.captureKeys();
    },

    start: function () {
        this.context.animate();
    },

    addNode: function (obj) {
        this.scene.root.addChild(obj.sceneNode);
    },

    removeNode: function (obj) {
        this.scene.root.removeChild(obj.sceneNode);
    },
};

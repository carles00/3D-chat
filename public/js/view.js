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
            let myUserPos = myUser.sceneNode.localToGlobal([0,40,0])
            
            //var campos = girl_pivot.localToGlobal([0,50,0]);
            let camtarget = myUser.sceneNode.localToGlobal([0, 40, 0]);
            let smoothtarget = vec3.lerp(
                vec3.create(),
                this.camera.target,
                camtarget,
                0.09
            );

            this.camera.perspective(
                60,
                gl.canvas.width / gl.canvas.height,
                0.1,
                1000
            );
            this.camera.lookAt(this.camera.position, smoothtarget, [0, 1, 0]);

            //clear
            this.renderer.clear(this.bgColor);
            //render scene
            this.renderer.render(this.scene, this.camera, null, 0b11);
            let room = World.roomsByName[World.currentRoom];
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

            //gizmo.setTargets([monkey]);
            //renderer.render( scene, camera, [gizmo] ); //render gizmo on top
        };

        this.context.onupdate = function(dt){
            Controller.update(dt);
        }

        this.context.onmouse = (e) => {
            //gizmo.onMouse(e);
        };

        this.context.onmouseup = function(e){
            Controller.mouseClick(e);
        }

        this.context.onmousemove = function(e){
            Controller.mouseMove(e);
        }

        this.context.onmousewheel = function(e){
            Controller.mouseWheel(e);
        }

        this.context.captureMouse(true);
	    this.context.captureKeys();

        //
    },

    start: function(){
        this.context.animate();
    },

    loadAnimation: function (name, url) {
        var anim = (this.animations[name] = new RD.SkeletalAnimation());
        anim.load(url);
        return anim;
    },

    addNode: function(obj){
        this.scene.root.addChild(obj.sceneNode);
    },
};

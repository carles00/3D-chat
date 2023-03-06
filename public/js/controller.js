let Controller = {
    update: function(dt){
        View.scene.update(dt);

        let t = getTime();
        let timeFactor = 1;

        let myUser = World.usersByName[World.myUser];
        let room = World.roomsByName[World.currentRoom];

        myUser.setAnimation = 'idle';

        if (gl.keys["UP"]) {
            myUser.parentNode.moveLocal([0, 0, 1]);
            myUser.setAnimation = 'walking'
        } else if (gl.keys["DOWN"]) {
            myUser.parentNode.moveLocal([0, 0, -1]);
            myUser.setAnimation = 'walking'
            timeFactor = -1;
        }
        if (gl.keys["LEFT"]) {
            myUser.parentNode.rotate(90 * DEG2RAD * dt, [0, 1, 0]);
        } else if (gl.keys["RIGHT"]) {
            myUser.parentNode.rotate(-90 * DEG2RAD * dt, [0, 1, 0]);
        }

        if(gl.keys["D"]){
            myUser.setAnimation = 'dance';
        }

        let pos = myUser.parentNode.position;
        let nearestPos = room.walkarea.adjustPosition(pos);
        myUser.parentNode.position = nearestPos;

        myUser.currentAnimation.assignTime(t * 0.001 * timeFactor);
        myUser.userCharacter.skeleton.copyFrom(myUser.currentAnimation.skeleton);
    },

    mouseClick: function(e){
        if (e.click_time < 200) {
            //fast click
            //compute collision with scene
            var ray = View.camera.getRay(e.canvasx, e.canvasy);
            var node = View.scene.testRay(ray, null, 10000, 0b1000);
            console.log(node);
        }
    },

    mouseMove: function(e){
        if (e.dragging) {
            //orbit camera around
            //camera.orbit( e.deltax * -0.01, RD.UP );
            //camera.position = vec3.scaleAndAdd( camera.position, camera.position, RD.UP, e.deltay );
            View.camera.move([-e.deltax * 0.1, e.deltay * 0.1, 0]);
            //girl_pivot.rotate(e.deltax*-0.003,[0,1,0]);
        }
    },

    mouseWheel: function(e){
        View.camera.moveLocal([0, 0, e.wheel < 0 ? 10 : -10]);
    }
}
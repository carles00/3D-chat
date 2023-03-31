let Controller = {
    update: function (dt) {
        View.scene.update(dt);

        let myUser = World.usersByName[World.myUser];
        let room = World.roomsByName[World.currentRoom];

        myUser.setAnimation = "idle";
        myUser.setDirection = 1;

        let move = [0, 0, 0];

        if (gl.keys["W"]) {
            move[2] = 1;
            myUser.setAnimation = "walking";
        } else if (gl.keys["S"]) {
            move[2] = -1;
            myUser.setAnimation = "walking";
            myUser.setDirection = -1;
            timeFactor = -1;
        }
        if (gl.keys["A"]) {
            move[0] = 1;
            myUser.setAnimation = "walking";
            myUser.setDirection = -1;
            timeFactor = -1;
        } else if (gl.keys["D"]) {
            move[0] = -1;
            myUser.setAnimation = "walking";
            myUser.setDirection = -1;
            timeFactor = -1;
        }
        move = this.normalize(move);

        myUser.parentNode.moveLocal(move);

        if (gl.keys["LEFT"]) {
            myUser.parentNode.rotate(90 * DEG2RAD * dt, [0, 1, 0]);
        } else if (gl.keys["RIGHT"]) {
            myUser.parentNode.rotate(-90 * DEG2RAD * dt, [0, 1, 0]);
        }

        if (gl.keys["B"]) {
            myUser.setAnimation = "dance";
        }

        let pos = myUser.parentNode.position;
        if (room.walkarea) {
            let nearestPos = room.walkarea.adjustPosition(pos);
            myUser.parentNode.position = nearestPos;
        }

        if (room.tableDJ)

        Chat.sendUpdate();
    },

    normalize: function (v) {
        let magnitude = v.reduce((a, b) => Math.sqrt(a * a + b * b), 0);
        let newV = [];
        if (magnitude !== 0) {
            v.forEach((element) => {
                newV.push(element / magnitude);
            });
            return newV;
        } else {
            return v;
        }
    },

    mouseClick: function (e) {
        // blurs previously active element to return focus to the canvas
        let activeElement = document.activeElement;
        activeElement.blur();

        if (e.click_time < 200) {
            //fast click
            //compute collision with scene
            var ray = View.camera.getRay(e.canvasx, e.canvasy);
            var node = View.scene.testRay(ray, null, 10000, 0b1000);

            if (!node) return;

            if (node.name.substr(0, 4) === "exit") {
                let room = World.roomsByName[World.currentRoom];
                let myUser = World.usersByName[World.myUser];
                room.exits.forEach((exit) => {
                    if (exit.walkArea.isInsideArea(myUser.parentNode.position) 
                                    && exit.to.substr(4) === node.name.substr(4)) {
                        let exitName = exit.to.substr(4)
                        if(exit.to.substr(4,9) === 'studio'){
                            if(World.invitedTo){
                                exitName = World.invitedTo;
                            }
                        }
                        Chat.changeRoom(World.currentRoom, exitName);
                        World.invitedTo = null;
                    }
                });
            }
        }
    },

    mouseMove: function (e) {
        if (e.dragging) {
            //orbit camera around
            //camera.orbit( e.deltax * -0.01, RD.UP );
            //camera.position = vec3.scaleAndAdd( camera.position, camera.position, RD.UP, e.deltay );
            //View.camera.move([-e.deltax * 0.1, e.deltay * 0.1, 0]);
            let myUser = World.usersByName[World.myUser];
            myUser.parentNode.rotate(e.deltax * -0.003, [0, 1, 0]);
        }
    },

    mouseWheel: function (e) {
        View.camera.moveLocal([0, 0, e.wheel < 0 ? 10 : -10]);
    },
};

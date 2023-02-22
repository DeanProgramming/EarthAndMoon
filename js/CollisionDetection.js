const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

window.addEventListener( 'pointermove', onPointerMove );

function onPointerMove( event )
{
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function GetPlanet(planetName, planetArray){
    for (let i = 0; i < planetArray.length; i++){
        if (planetArray[i].Name === planetName){
            return planetArray[i];
        }
    }
    return null;
}

function DetectionCollisions(scene, camera, planetArray){

    raycaster.setFromCamera( pointer, camera );

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );

    let collisionObject = null;

    if (intersects[0] != null) {
        let foundPlanet = GetPlanet(intersects[0].object.name, planetArray);

        if (foundPlanet != null)
        {
            collisionObject = foundPlanet;
        }
        else
        {
            console.log("Detected a planet not in list = " + intersects[0].object.name);
        }
    }

    return collisionObject;
}
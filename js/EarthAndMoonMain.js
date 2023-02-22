import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm';

const debugHelpers = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

window.addEventListener( 'resize', onWindowResize, false );
window.addEventListener( 'mousewheel', onDocumentMouseWheel, false );

let jumpToPlanet = false;
let limiter = 50;
let rotateCamera = false;
let leftSideClicked = false;

GeneratePlanets(scene);

const gui = new GUI( { width: 1200 } );
const GUI_Planet_Info = {
    Planet_Name: '',
    Planet_Radius: '',
    Size_to_Earth: 0,
};

gui.add( GUI_Planet_Info, 'Planet_Name').listen();
gui.add( GUI_Planet_Info, 'Planet_Radius' ).listen();
gui.add( GUI_Planet_Info, 'Size_to_Earth' ).listen();

let SelectedPlanet = null;
let ZPosition = 150;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const omiDirectionalLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, .2 );
scene.add( omiDirectionalLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set( 50, 0, 100);
directionalLight.castShadow = true;
scene.add( directionalLight );

//Set up shadow properties for the light
directionalLight.shadow.mapSize.width = 512; // default
directionalLight.shadow.mapSize.height = 512; // default
directionalLight.shadow.camera.near = 0.5; // default
directionalLight.shadow.camera.far = 500; // default

const shadowSize = 100;
directionalLight.shadow.camera.left = - shadowSize;
directionalLight.shadow.camera.right = shadowSize;
directionalLight.shadow.camera.top = shadowSize;
directionalLight.shadow.camera.bottom = - shadowSize;


if (debugHelpers)
{
    scene.add( new THREE.CameraHelper(directionalLight.shadow.camera ) );
}

animate();
function animate() {
    requestAnimationFrame( animate );

    HandlePlanetSelection();
    HandleMoonPositions();
    HandleCameraPosition();

    renderer.render( scene, camera );
}

function HandleMoonPositions(){
    for (let i = 0; i < planetArray.length; i++)
    {
        if (planetArray[i].AssignedMoonClass == null){
            continue;
        }

        if (planetArray[i].Planet != null && planetArray[i].AssignedMoonClass.Orbiting != null){
            let orbitingPlanet = (planetArray[i].Planet);
            let orbitingPlanetPosition = (planetArray[i].Planet.position);
            let planetPosition =  (planetArray[i].AssignedMoonClass.Orbiting.Planet.position);

            orbitingPlanetPosition.sub(planetPosition);

            let axis = planetArray[i].AssignedMoonClass.AxisRotation;
            let angle = Math.PI / 2;

            orbitingPlanetPosition.applyAxisAngle( axis, (angle * planetArray[i].AssignedMoonClass.OrbitSpeed));
            orbitingPlanetPosition.add(planetPosition);

            orbitingPlanet.position.x = orbitingPlanetPosition.x;
            orbitingPlanet.position.y = orbitingPlanetPosition.y;
            orbitingPlanet.position.z = orbitingPlanetPosition.z;
        }
    }
}

function HandlePlanetSelection()
{
    let foundPlanet = DetectionCollisions(scene, camera, planetArray);

    if (foundPlanet != null){
        GUI_Planet_Info.Planet_Name = foundPlanet.Name;
        GUI_Planet_Info.Planet_Radius = foundPlanet.Radius;
        GUI_Planet_Info.Size_to_Earth = foundPlanet.SizeRelativeToEarth;
    } else {
        GUI_Planet_Info.PlanetName = "";
    }

    for (let i = 0; i < planetArray.length; i++){
        if (planetArray[i].Planet != null){
            planetArray[i].Planet.rotation.y += planetArray[i].RotationSpeed;
        }
    }
}

function HandleCameraPosition()
{
    if (planetArray[0].Planet == null){
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 150;
        return null;
    }

    if ( SelectedPlanet == null){
        SelectedPlanet = planetArray[0];
        jumpToPlanet = true;
    }

    if (jumpToPlanet)
    {
        camera.position.x = SelectedPlanet.Planet.position.x;
        camera.position.y = SelectedPlanet.Planet.position.y;
        camera.position.z = SelectedPlanet.Planet.position.z + ZPosition;
        jumpToPlanet = false;
        return null;
    }

    let cameraPosition = camera.position;
    let selectedPosition = SelectedPlanet.Planet.position;

    cameraPosition.sub(selectedPosition);

    let axis = new THREE.Vector3(0, 1, 0);
    let angle = Math.PI / 2;
    let rotationSpeed = 0;

    if (rotateCamera)
    {
        if (leftSideClicked)
        {
            rotationSpeed = -.025;
        }
        else
        {
            rotationSpeed = .025;
        }
    }

    cameraPosition.applyAxisAngle( axis, (angle * rotationSpeed));
    cameraPosition.add(selectedPosition);

    camera.position.x = cameraPosition.x;
    camera.position.y = cameraPosition.y;
    camera.position.z = cameraPosition.z;

    camera.lookAt( SelectedPlanet.Planet.position );

    let direction = new THREE.Vector3((cameraPosition.x - selectedPosition.x),
        (cameraPosition.y - selectedPosition.y),
        (cameraPosition.z - selectedPosition.z));
    direction.normalize();

    let xNewPosition = selectedPosition.x + (direction.x * limiter);
    let yNewPosition = selectedPosition.y + (direction.y * limiter);
    let zNewPosition = selectedPosition.z + (direction.z * limiter);

    camera.position.x = xNewPosition;
    camera.position.y = yNewPosition;
    camera.position.z = zNewPosition;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseWheel( event )
{
    ZPosition += event.deltaY/10;
    ZPosition = clampValue(ZPosition, 30, 200);
    limiter = ZPosition;
}

document.addEventListener('mousedown', function (event)
{
    let previousPlanet = SelectedPlanet;
    SelectedPlanet = DetectionCollisions(scene, camera, planetArray);

    if (SelectedPlanet === null){
        SelectedPlanet = previousPlanet;
    }

    if (previousPlanet !== SelectedPlanet){
        jumpToPlanet = true;
        ZPosition = 150;
    } else {
        rotateCamera = true;
        leftSideClicked = event.pageX < (innerWidth / 2);
    }
});

document.addEventListener('mouseup', function (event)
{
    rotateCamera = false;
});

function clampValue(num, lower, upper) {
    if (num < lower) return lower;
    if (num > upper) return upper;
    return num
}
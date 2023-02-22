class PlanetClass{
    Name = 'EMPTYDATA';
    Radius = '';
    SizeRelativeToEarth;
    RotationSpeed = 0;
    Planet = null;
    PlanetPath = '';
    AssignedMoonClass = null;
}

class MoonClass {
    Orbiting = null;
    OrbitSpeed = 0;
    StartingPosition = new THREE.Vector3( 0, 0, 0 );
    AxisRotation =  new THREE.Vector3( 0, 0, 0 );
}


const planetBaseSize = 15;

const planetArray = [];

let planet = new PlanetClass();
let moonClass = new MoonClass();

planet.Name = "Earth";
planet.Radius = "6,371 km";
planet.SizeRelativeToEarth =1;
planet.RotationSpeed = 0.01;
planet.PlanetPath = 'PlanetImages/Earth.jpg';

planetArray.push(planet)

planet = new PlanetClass();
planet.Name = "Moon";
planet.Radius = "1,737 km";
planet.SizeRelativeToEarth = .5;
planet.RotationSpeed = 0.005;
planet.PlanetPath = 'PlanetImages/Moon.jpg';

moonClass.Orbiting = planetArray[0];
moonClass.OrbitSpeed = .0025;
moonClass.StartingPosition = new THREE.Vector3(0, 0, 80);
moonClass.AxisRotation = new THREE.Vector3(.15, 1, 0);

planet.AssignedMoonClass = moonClass;

planetArray.push(planet);

function GeneratePlanets(GeneratedScene){
    for (let i = 0; i < planetArray.length; i++) {
        GeneratePlanet(GeneratedScene, planetArray[i]);
    }
}

function GeneratePlanet(GeneratedScene, Planet){
    const geometry = new THREE.SphereGeometry( planetBaseSize * Planet.SizeRelativeToEarth, 32, 16 );

    const loader = new THREE.TextureLoader();
// load a resource
    loader.load(
        // resource URL
        Planet.PlanetPath,

        // onLoad callback
        function ( texture ) {
            // in this example we create the material when the texture is loaded
            const material = new THREE.MeshStandardMaterial( {
                map: texture
            } );
            Planet.Planet = new THREE.Mesh( geometry, material );
            Planet.Planet.name = Planet.Name;

            if (Planet.AssignedMoonClass != null){
                Planet.Planet.position.x = Planet.AssignedMoonClass.StartingPosition.x;
                Planet.Planet.position.y = Planet.AssignedMoonClass.StartingPosition.y;
                Planet.Planet.position.z = Planet.AssignedMoonClass.StartingPosition.z;
            }
            else
            {
                Planet.Planet.position.x = 0;
                Planet.Planet.position.y = 0;
                Planet.Planet.position.z = 0;
            }

            Planet.Planet.castShadow = true;
            Planet.Planet.receiveShadow = true;

            GeneratedScene.add( Planet.Planet );
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        function ( err ) {
            console.error( 'An error happened.' );
        }
    );
}
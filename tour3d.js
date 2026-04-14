// tour3d.js
window.addEventListener('load', init3DTour);

let scene, camera, renderer;
let player;
let isTourActive = false;

let buildingMeshes = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Cyberpunk Rooms Data
const rooms = [
    { name: "Staff Room", pos: new THREE.Vector3(-20, 2.5, 20), color: 0xff00ff, size: [10, 5, 10], link: "#about" },
    { name: "Labs", pos: new THREE.Vector3(0, 3, -10), color: 0x00f3ff, size: [15, 6, 12], link: "#labs" },
    { name: "Class Room", pos: new THREE.Vector3(25, 2.5, 5), color: 0xfcee0a, size: [12, 5, 12], link: "#projects" }
];

function init3DTour() {
    const container = document.getElementById('tour-container');
    
    // Scene setup - Cyberpunk dark void
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c); 
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.015);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Resize handler
    window.addEventListener('resize', () => {
        if(container && camera && renderer) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // DIM
    scene.add(ambientLight);

    const pinkLight = new THREE.DirectionalLight(0xff00ff, 1.2); // Neon pink
    pinkLight.position.set(50, 100, 50);
    pinkLight.castShadow = true;
    scene.add(pinkLight);

    const cyanLight = new THREE.DirectionalLight(0x00f3ff, 0.8); // Neon cyan
    cyanLight.position.set(-50, 50, -50);
    scene.add(cyanLight);

    // Dark Ground
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1, metalness: 0.8 }); 
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Wireframe Grid
    const gridHelper = new THREE.GridHelper(300, 100, 0x00f3ff, 0x00f3ff);
    gridHelper.position.y = 0.05;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Create solid glowing curved road
    createRoad();

    // Create Buildings
    createBuildings();

    // Create Player (Student)
    createPlayer();

    // Input handling
    setupControls();
    
    // Click interactor
    setupRaycaster(container);

    isTourActive = true;
    animate();
    
    // Fix page scrolling logic: only trap keys if canvas is clicked
    renderer.domElement.tabIndex = 1;
    container.addEventListener('click', () => {
        renderer.domElement.focus();
    });
}

function createRoad() {
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-60, 0, 40),
        new THREE.Vector3(-20, 0, 25),
        new THREE.Vector3(-5, 0, 10),
        new THREE.Vector3(10, 0, 0),
        new THREE.Vector3(20, 0, -5),
        new THREE.Vector3(35, 0, 10),
        new THREE.Vector3(60, 0, 20)
    ]);

    // TubeGeometry creates a pipe along the curve. We make it very flat to act as a road!
    const tubeGeo = new THREE.TubeGeometry(curve, 100, 3, 8, false);
    tubeGeo.scale(1, 0.05, 1);
    
    // Dark, wet road reflecting neon lights
    const roadMat = new THREE.MeshStandardMaterial({ 
        color: 0x111111, 
        roughness: 0.2, 
        metalness: 0.8
    });
    const roadMesh = new THREE.Mesh(tubeGeo, roadMat);
    roadMesh.position.y = 0.1; 
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);

    // Add neon edges to the road
    const edgesGeo = new THREE.EdgesGeometry(tubeGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.4 });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    edges.position.y = 0.11;
    scene.add(edges);
}

function createBuildings() {
    rooms.forEach(room => {
        const geo = new THREE.BoxGeometry(room.size[0], room.size[1], room.size[2]);
        
        // Cyberpunk glowing material
        const mat = new THREE.MeshStandardMaterial({ 
            color: room.color, 
            emissive: room.color, 
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.95
        });
        
        const building = new THREE.Mesh(geo, mat);
        building.position.copy(room.pos);
        building.castShadow = true;
        building.receiveShadow = true;
        
        // Add wireframe glow
        const wireGeo = new THREE.EdgesGeometry(geo);
        const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        const wireframe = new THREE.LineSegments(wireGeo, wireMat);
        building.add(wireframe);
        
        building.userData = { link: room.link, name: room.name };
        buildingMeshes.push(building); 
        scene.add(building);
    });
}

function createPlayer() {
    const geo = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    // Cool cyan player
    const mat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, emissive: 0x00f3ff, emissiveIntensity: 0.5 }); 
    player = new THREE.Mesh(geo, mat);
    player.position.set(-50, 1.5, 35); // Start on the path
    player.castShadow = true;
    scene.add(player);
}

const keys = { w: false, a: false, s: false, d: false };

function setupControls() {
    window.addEventListener('keydown', (e) => {
        if (!isTourActive) return;
        if (document.activeElement !== renderer.domElement) return;

        const key = e.key.toLowerCase();
        if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) {
            e.preventDefault(); 
            if(key === 'w' || key === 'arrowup') keys.w = true;
            if(key === 'a' || key === 'arrowleft') keys.a = true;
            if(key === 's' || key === 'arrowdown') keys.s = true;
            if(key === 'd' || key === 'arrowright') keys.d = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (!isTourActive) return;
        const key = e.key.toLowerCase();
        if(key === 'w' || key === 'arrowup') keys.w = false;
        if(key === 'a' || key === 'arrowleft') keys.a = false;
        if(key === 's' || key === 'arrowdown') keys.s = false;
        if(key === 'd' || key === 'arrowright') keys.d = false;
    });
}

function setupRaycaster(container) {
    container.addEventListener('click', onMouseClick, false);
}

function onMouseClick(event) {
    if(!isTourActive) return;
    
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(buildingMeshes);

    if (intersects.length > 0) {
        const targetLink = intersects[0].object.userData.link;
        if(targetLink) {
            window.location.href = targetLink;
        }
    }
}

function updatePlayer() {
    const speed = 0.25; // slightly faster moving
    const turnSpeed = 0.05;

    if (keys.w) player.translateZ(-speed);
    if (keys.s) player.translateZ(speed);
    if (keys.a) player.rotation.y += turnSpeed;
    if (keys.d) player.rotation.y -= turnSpeed;
}

function updateCamera() {
    const relativeCameraOffset = new THREE.Vector3(0, 4, 10); 
    const cameraOffset = relativeCameraOffset.applyMatrix4(player.matrixWorld);
    
    camera.position.lerp(cameraOffset, 0.1);
    camera.lookAt(player.position);
}

function checkProximity() {
    let nearestRoom = null;
    let minDistance = Infinity;

    rooms.forEach(room => {
        const dist = player.position.distanceTo(room.pos);
        if (dist < 15 && dist < minDistance) {
            minDistance = dist;
            nearestRoom = room;
        }
    });

    const popup = document.getElementById('room-popup');
    const roomNameLabel = document.getElementById('room-name');

    if (nearestRoom) {
        roomNameLabel.innerText = nearestRoom.name;
        popup.classList.remove('hidden');
    } else {
        popup.classList.add('hidden');
    }
}

function animate() {
    if (!isTourActive) return;
    requestAnimationFrame(animate);

    updatePlayer();
    updateCamera();
    checkProximity();

    // Subtle glow pulsing effect on buildings could go here

    renderer.render(scene, camera);
}

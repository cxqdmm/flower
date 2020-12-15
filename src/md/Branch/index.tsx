import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CurveBranch } from './curveBranch';
import { initCoordinateGrid } from '../../utils/initCoordinateGrid';
interface IProps {
  className?: string;
}

const windForce = new THREE.Vector3(0, 0, 0);

const BranchComp: React.FC<IProps> = React.memo((props) => {
  const { className } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    // camera
    let camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      3000,
    );
    camera.position.z = 40;

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);

    // scene
    let scene = new THREE.Scene();
    scene.background = new THREE.Color('white');

    // light
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);
    scene.add(light);

    const light2 = new THREE.AmbientLight(0x003973);
    light2.intensity = 1.0;
    scene.add(light2);

    // @ts-ignore
    let stats = new Stats();
    ref.current.appendChild(stats.dom);
    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 0;
    controls.maxDistance = 5000;
    // 正文

    let branch = new CurveBranch({ flexible: 0.4, budCount: 3, sizeWeights: 20 });
    scene.add(branch.mesh);
    const boxGeometry = new THREE.BoxBufferGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x10ff00 });
    const curveHandles = [];
    for (const handlePos of branch.particles) {
      const handle = new THREE.Mesh(boxGeometry, boxMaterial);
      handle.position.copy(handlePos.position);
      curveHandles.push(handle);
      scene.add(handle);
    }

    initCoordinateGrid(scene);
    // function simulate(now: number) {
    //   const windStrength = Math.cos(now / 7000) * 20 + 40;

    //   windForce.set(Math.sin(now / 2000), 0, 0);
    //   windForce.normalize();
    //   windForce.multiplyScalar(windStrength);

    //   // update force
    //   const particles = branch.particles;
    //   for (let i = 0; i < particles.length; i++) {
    //     particles[i].addForce(windForce);
    //   }

    //   branch.update();
    // }

    function animate(now: number) {
      requestAnimationFrame(animate);
      // simulate(now);
      renderer.render(scene, camera);
      stats.update();
    }

    animate(0);
  }, []);
  return <div ref={ref} className={className}></div>;
});

export default BranchComp;

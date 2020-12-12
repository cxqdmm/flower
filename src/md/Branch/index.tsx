import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CurveBranch } from './curveBranch';
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
    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 300);
    camera.position.z = 50;

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);

    // scene
    let scene = new THREE.Scene();
    scene.background = new THREE.Color('white');

    // light
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1);
    scene.add(light);
    // @ts-ignore
    let stats = new Stats();
    ref.current.appendChild(stats.dom);
    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minDistance = 0;
    controls.maxDistance = 100;
    // 正文
    const material = new THREE.MeshLambertMaterial({ color: 0x4caf50 });
    let branch = new CurveBranch({ flexible: 0.4, budCount: 1, sizeWeights: 16 });
    const objectToCurve = new THREE.Mesh(branch.geometry, material);
    // scene.add(branch.mesh);
    scene.add(objectToCurve);

    function simulate(now: number) {
      const windStrength = Math.cos(now / 7000) * 20 + 40;

      windForce.set(Math.sin(now / 2000), 0, 0);
      windForce.normalize();
      windForce.multiplyScalar(windStrength);

      // update force
      const particles = branch.particles;
      for (let i = 0; i < particles.length; i++) {
        particles[i].addForce(windForce);
      }

      branch.update();
    }

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

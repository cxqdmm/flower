import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Flow } from 'three/examples/jsm/modifiers/CurveModifier';
interface IProps {
  className?: string;
}

const BranchComp: React.FC<IProps> = React.memo((props) => {
  const { className } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    // camera
    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 300);
    camera.position.set(20, 20, 40);
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

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(10, 0, -10),
      new THREE.Vector3(10, 0, 10),
      new THREE.Vector3(-10, 0, 10),
      new THREE.Vector3(-10, 0, -10),
    ]);
    // @ts-ignore
    curve.curveType = 'centripetal';
    // @ts-ignore
    curve.closed = true;

    const points = curve.getPoints(50);
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0x00ff00 }),
    );
    scene.add(line);
    const material = new THREE.MeshLambertMaterial({ color: 0xff00ff });
    const cylinder = new THREE.CylinderBufferGeometry(5, 5, 1);
    cylinder.rotateX(Math.PI / 2);
    cylinder.rotateZ(Math.PI / 2);
    const objectToCurve = new THREE.Mesh(cylinder, material);

    const flow = new Flow(objectToCurve);
    flow.updateCurve(0, curve);
    scene.add(flow.object3D);

    function animate(now: number) {
      requestAnimationFrame(animate);
      flow.moveAlongCurve(0.001);
      renderer.render(scene, camera);
      stats.update();
    }

    animate(0);
  }, []);
  return <div ref={ref} className={className}></div>;
});

export default BranchComp;

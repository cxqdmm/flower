import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Branch } from './branch';
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

    let scene = new THREE.Scene();
    scene.background = new THREE.Color('white');
    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 400);
    camera.position.z = 300;
    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    ref.current.appendChild(renderer.domElement);

    // @ts-ignore
    let stats = new Stats();
    ref.current.appendChild(stats.dom);

    // 正文

    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
    });

    let branch = new Branch({ budCount: 16, sizeWeights: 160 });
    const line = new THREE.Line(branch.geometry, material);
    scene.add(line);

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
      simulate(now);
      renderer.render(scene, camera);
      stats.update();
    }

    animate(0);
  }, []);
  return <div ref={ref} className={className}></div>;
});

export default BranchComp;

import React, { useEffect, useRef } from 'react';
import cls from 'classnames';
import * as THREE from 'three';

const PREFIX = 'OrientationTransform';

interface IProps {
  className?: string;
}

const OrientationTransform: React.FC<IProps> = React.memo(function OrientationTransform(props) {
  const { className } = props;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    let camera: THREE.PerspectiveCamera,
      scene: THREE.Scene,
      renderer: THREE.WebGLRenderer,
      mesh: THREE.Mesh,
      target: THREE.Mesh;

    const spherical = new THREE.Spherical();
    const rotationMatrix = new THREE.Matrix4();
    const targetQuaternion = new THREE.Quaternion();
    const clock = new THREE.Clock();
    const speed = 2;
    init();
    animate();
    function init() {
      if (!ref.current) {
        return;
      }
      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
      camera.position.z = 5;
      scene = new THREE.Scene();
      const geometry = new THREE.ConeBufferGeometry(0.2, 0.5, 16);
      geometry.rotateX(Math.PI * 0.5);
      const material = new THREE.MeshNormalMaterial();
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const targetGeometry = new THREE.SphereBufferGeometry(0.05);
      const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      target = new THREE.Mesh(targetGeometry, targetMaterial);
      scene.add(target);

      //

      const sphereGeometry = new THREE.SphereBufferGeometry(2, 32, 32);
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      scene.add(sphere);

      //

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      ref.current.appendChild(renderer.domElement);

      //

      window.addEventListener('resize', onResize, false);

      //

      generateTarget();
    }
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      if (!mesh.quaternion.equals(targetQuaternion)) {
        const step = speed * delta;
        mesh.quaternion.rotateTowards(targetQuaternion, step);
      }

      renderer.render(scene, camera);
    }

    function generateTarget() {
      // generate a random point on a sphere

      spherical.theta = Math.random() * Math.PI * 2;
      spherical.phi = Math.acos(2 * Math.random() - 1);
      spherical.radius = 2;

      target.position.setFromSpherical(spherical);

      // compute target rotation

      rotationMatrix.lookAt(target.position, mesh.position, mesh.up);
      targetQuaternion.setFromRotationMatrix(rotationMatrix);

      setTimeout(generateTarget, 2000);
    }
  }, []);
  return (
    <div ref={ref} className={cls(`${PREFIX}`, className)}>
      1
    </div>
  );
});

export default OrientationTransform;

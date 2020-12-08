import { map } from 'lodash';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

interface IProps {
  className?: string;
}

interface IBranchOptions {
  budCount: number;
  sizeWeights: number;
  flexible: number;
}

const defaultBranchOptions = {
  budCount: 1,
  sizeWeights: 1,
  flexible: 1,
};

const windForce = new THREE.Vector3(0, 0, 0);
const diff = new THREE.Vector3(0, 0, 0);
class Particle {
  position: THREE.Vector3;
  previous: THREE.Vector3;
  original: THREE.Vector3;
  stableFactor: number;
  a: THREE.Vector3;
  tmp: THREE.Vector3;
  tmp2: THREE.Vector3;
  constructor(x: number, y: number, z: number, stableFactor: number) {
    this.position = new THREE.Vector3(x, y, z);
    this.previous = new THREE.Vector3(x, y, z);
    this.original = new THREE.Vector3(x, y, z);
    this.stableFactor = stableFactor;
    this.a = new THREE.Vector3(0, 0, 0); // acceleration
    this.tmp = new THREE.Vector3();
    this.tmp2 = new THREE.Vector3();
  }

  addForce(force: THREE.Vector3) {
    this.a.add(this.tmp2.copy(force));
  }

  integrate() {
    const newPos = this.tmp.subVectors(this.position, this.previous);
    newPos.add(this.position);
    newPos.add(this.a.multiplyScalar(this.stableFactor).multiplyScalar(0.0001));

    this.tmp = this.previous;
    this.previous = this.position;
    this.position = newPos;

    this.a.set(0, 0, 0);
  }
}

function lengthConstraints(p1: Particle, p2: Particle, distance: number) {
  diff.subVectors(p2.position, p1.position);
  const currentDist = diff.length();
  if (currentDist === 0) return; // prevents division by 0
  const correction = diff.multiplyScalar(1 - distance / currentDist);
  const correctionHalf = correction.multiplyScalar(0.5);
  p1.position.add(correctionHalf);
  p2.position.sub(correctionHalf);
}

// 枝
class Branch {
  options: IBranchOptions;
  particles: Particle[];
  constraints: Array<[Particle, Particle, number]>;
  constructor(options: Partial<IBranchOptions>) {
    this.options = Object.assign({}, defaultBranchOptions, options);
    this.particles = [];
    this.constraints = [];
    this.initParticles();
    this.initConstraints();
  }

  initParticles() {
    const step = this.options.sizeWeights / (this.options.budCount + 1);
    const flexibleStep = (1 - this.options.flexible) / (this.options.budCount + 1);
    this.particles.push(new Particle(0, 0, 0, 1));
    let nextFlexible = 1 - flexibleStep;
    for (let i = 0; i < this.options.budCount; i++) {
      nextFlexible -= flexibleStep;
      this.particles.push(new Particle(0, step * (i + 1), 0, nextFlexible));
    }
    nextFlexible -= flexibleStep;
    this.particles.push(new Particle(0, this.options.sizeWeights, 0, 0));
  }

  initConstraints() {
    for (let i = 0; i < this.particles.length - 1; i++) {
      diff.subVectors(this.particles[i].original, this.particles[i + 1].original);
      this.constraints.push([this.particles[i], this.particles[i + 1], diff.length()]);
    }
  }

  getPointsFromParticles() {
    return map(this.particles, (particle) => particle.position);
  }
}

const BranchComp: React.FC<IProps> = React.memo((props) => {
  const { className } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    camera.position.z = 5;
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

    let branch = new Branch({});
    const geometry = new THREE.BufferGeometry().setFromPoints(branch.getPointsFromParticles());
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    function simulate(now: number) {
      const windStrength = Math.cos(now / 7000) * 20 + 40;

      windForce.set(Math.sin(now / 2000), 0, 0);
      windForce.normalize();
      windForce.multiplyScalar(windStrength);

      // update position
      const particles = branch.particles;
      for (let i = 0; i < particles.length; i++) {
        particles[i].addForce(windForce);
      }

      for (let i = 0, il = particles.length; i < il; i++) {
        const particle = particles[i];
        particle.integrate();
      }

      // constraint
      const constraints = branch.constraints;
      const il = constraints.length;

      for (let i = 0; i < il; i++) {
        const constraint = constraints[i];
        lengthConstraints(constraint[0], constraint[1], constraint[2]);
      }

      // fix root
      const root = branch.particles[0];
      root.position.copy(root.original);
    }

    function animate(now: number) {
      requestAnimationFrame(animate);
      simulate(now);

      render();
      stats.update();
    }

    function render() {
      const p = branch.particles;

      for (let i = 0, il = p.length; i < il; i++) {
        const v = p[i].position;

        geometry.attributes.position.setXYZ(i, v.x, v.y, v.z);
      }

      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate(0);
  }, []);
  return <div ref={ref} className={className}></div>;
});

export default BranchComp;

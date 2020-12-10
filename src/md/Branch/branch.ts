import { map } from 'lodash';
import * as THREE from 'three';
import { Particle } from './particle';

interface IBranchOptions {
  budCount: number;
  sizeWeights: number;
  flexible: number;
}

const defaultBranchOptions = {
  budCount: 1,
  sizeWeights: 10,
  flexible: 1,
};

const diff = new THREE.Vector3(0, 0, 0);

function lengthConstraints(p1: Particle, p2: Particle, distance: number) {
  diff.subVectors(p2.position, p1.position);
  const currentDist = diff.length();
  if (currentDist === 0) return; // prevents division by 0
  const correction = diff.multiplyScalar(1 - distance / currentDist);
  const correctionHalf = correction.multiplyScalar(0.5);
  p1.position.add(correctionHalf);
  p2.position.sub(correctionHalf);
}

export class Branch {
  options: IBranchOptions;
  particles: Particle[];
  constraints: Array<[Particle, Particle, number]>;
  geometry: THREE.BufferGeometry;
  constructor(options: Partial<IBranchOptions>) {
    this.options = Object.assign({}, defaultBranchOptions, options);
    this.particles = [];
    this.constraints = [];
    this.initParticles();
    this.initConstraints();
    this.geometry = new THREE.BufferGeometry().setFromPoints(this.getPointsFromParticles());
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
    this.particles.push(new Particle(0, this.options.sizeWeights, 0, nextFlexible));
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

  updatePosition() {
    for (let i = 0, il = this.particles.length; i < il; i++) {
      const particle = this.particles[i];
      particle.integrate();
    }
  }

  runConstraint() {
    const root = this.particles[0];
    root.position.copy(root.original);

    // constraint
    const constraints = this.constraints;
    const il = constraints.length;

    for (let i = 0; i < il; i++) {
      const constraint = constraints[i];
      lengthConstraints(constraint[0], constraint[1], constraint[2]);
    }
  }

  update() {
    this.updatePosition();
    this.runConstraint();

    const p = this.particles;
    for (let i = 0, il = p.length; i < il; i++) {
      const v = p[i].position;
      this.geometry.attributes.position.setXYZ(i, v.x, v.y, v.z);
    }
    this.geometry.attributes.position.needsUpdate = true;
  }
}

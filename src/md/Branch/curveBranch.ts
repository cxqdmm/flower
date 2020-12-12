import { map } from 'lodash';
import * as THREE from 'three';
import { Particle } from './particle';
import { Flow } from 'three/examples/jsm/modifiers/CurveModifier';
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
const diff2 = new THREE.Vector3(0, 0, 0);
const middleVector = new THREE.Vector3(0, 1, 0);
const rotateAxis = new THREE.Vector3(0, 0, 0);

function runLengthConstraints(p1: Particle, p2: Particle, distance: number) {
  diff.subVectors(p2.position, p1.position);
  const currentDist = diff.length();
  if (currentDist === 0) return; // prevents division by 0
  const correction = diff.multiplyScalar(1 - distance / currentDist);
  const correctionHalf = correction.multiplyScalar(0.5);
  p1.position.add(correctionHalf);
  p2.position.sub(correctionHalf);
}

function runAngleConstraints(p1: Particle, p2: Particle, p3: Particle) {
  diff.subVectors(p2.position, p1.position);
  diff2.subVectors(p3.position, p2.position);
  const angle = diff.angleTo(diff2);
  const maxAngle = (Math.PI / 2) * (1 - p2.stableFactor) * (1 - p2.stableFactor);
  if (angle > maxAngle) {
    rotateAxis.copy(diff2).cross(diff).normalize();
    diff2.applyAxisAngle(rotateAxis, angle - maxAngle);
    p3.position.copy(p2.position).add(diff2);
  }
}

const params = {
  spline: 'GrannyKnot',
  radius: 0.5,
  extrusionSegments: 100,
  radiusSegments: 3,
  closed: true,
  animationView: false,
  lookAhead: false,
  cameraHelper: false,
};

const material = new THREE.MeshLambertMaterial({ color: 0xff00ff });

export class CurveBranch {
  options: IBranchOptions;
  particles: Particle[];
  lengthConstraints: Array<[Particle, Particle, number]>;
  geometry: THREE.BufferGeometry;
  angleConstraints: Array<[Particle, Particle, Particle]>;
  flow: Flow;
  constructor(options: Partial<IBranchOptions>) {
    this.options = Object.assign({}, defaultBranchOptions, options);
    this.particles = [];
    this.lengthConstraints = [];
    this.angleConstraints = [];
    this.initParticles();
    this.initLengthConstraints();
    this.initAngleConstraints();
    this.getPointsFromParticles();
    this.geometry = this.initGeometry();

    const objectToCurve = new THREE.Mesh(this.geometry, material);
    this.flow = new Flow(objectToCurve);
  }

  get mesh() {
    return this.flow.object3D;
  }

  initGeometry() {
    return new THREE.CylinderBufferGeometry(2, 2, this.options.sizeWeights, 32);
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

  initLengthConstraints() {
    for (let i = 0; i < this.particles.length - 1; i++) {
      diff.subVectors(this.particles[i].original, this.particles[i + 1].original);
      this.lengthConstraints.push([this.particles[i], this.particles[i + 1], diff.length()]);
    }
  }

  initAngleConstraints() {
    for (let i = 0; i < this.particles.length - 2; i++) {
      this.angleConstraints.push([this.particles[i], this.particles[i + 1], this.particles[i + 2]]);
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

    // 长度限制
    const lengthConstraints = this.lengthConstraints;
    for (let i = 0; i < lengthConstraints.length; i++) {
      const constraint = lengthConstraints[i];
      runLengthConstraints(constraint[0], constraint[1], constraint[2]);
    }

    // 固定根节点
    root.position.copy(root.original);

    // 限制第一段的角度
    const root2 = this.particles[1];

    diff.subVectors(root2.position, root.position);
    const angle = diff.angleTo(middleVector);
    if (angle > 0.3) {
      rotateAxis.copy(diff).cross(middleVector).normalize();
      diff.applyAxisAngle(rotateAxis, angle - 0.3);
      root2.position.copy(root.position).add(diff);
    }

    // 角度限制
    const angleConstraints = this.angleConstraints;
    for (let i = 0; i < angleConstraints.length; i++) {
      const constraint = angleConstraints[i];
      runAngleConstraints(constraint[0], constraint[1], constraint[2]);
    }
  }

  update() {
    this.updatePosition();
    this.runConstraint();
    const curve = new THREE.CatmullRomCurve3(this.getPointsFromParticles());
    this.flow.updateCurve(0, curve);
  }
}

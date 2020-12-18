import { map } from 'lodash';
import * as THREE from 'three';

export class Particle {
  position: THREE.Vector3;
  original: THREE.Vector3;
  stableFactor: number;
  a: THREE.Vector3;
  tmp: THREE.Vector3;
  tmp2: THREE.Vector3;
  constructor(x: number, y: number, z: number, stableFactor: number) {
    this.position = new THREE.Vector3(x, y, z);
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
    const newPos = this.tmp.copy(this.original);
    newPos.add(this.a.multiplyScalar((1 - this.stableFactor) * (1 - this.stableFactor)));
    this.position = newPos;
    this.a.set(0, 0, 0);
  }
}

interface IBranchOptions {
  budCount: number;
  sizeWeights: number;
  flexible: number;
  shape: THREE.Shape;
}

const defaultBranchOptions = {
  budCount: 1,
  sizeWeights: 10,
  flexible: 1,
  shape: new THREE.Shape([
    new THREE.Vector2(-1, 0),
    new THREE.Vector2(-0.5, 1.5),
    new THREE.Vector2(2, 1.5),
    new THREE.Vector2(1, 0),
  ]),
};

const diff = new THREE.Vector3(0, 0, 0);
function runLengthConstraints(p1: Particle, p2: Particle, distance: number) {
  diff.subVectors(p2.position, p1.position);
  const currentDist = diff.length();
  if (currentDist === 0) return; // prevents division by 0
  const correction = diff.multiplyScalar(1 - distance / currentDist);
  const correctionHalf = correction.multiplyScalar(0.5);
  p1.position.add(correctionHalf);
  p2.position.sub(correctionHalf);
}

export class CurveBranch {
  options: IBranchOptions;
  particles: Particle[];
  lengthConstraints: Array<[Particle, Particle, number]>;
  geometry?: THREE.BufferGeometry;
  angleConstraints: Array<[Particle, Particle, Particle]>;
  _shape?: THREE.Shape;
  extrudeSetting: THREE.ExtrudeGeometryOptions;
  force: THREE.Vector3;

  constructor(options: Partial<IBranchOptions>) {
    this.options = Object.assign({}, defaultBranchOptions, options);
    this.extrudeSetting = {
      steps: 100,
      bevelEnabled: true,
    } as THREE.ExtrudeGeometryOptions;
    this.particles = [];
    this.lengthConstraints = [];
    this.angleConstraints = [];
    this.initParticles();
    this.initLengthConstraints();
    this.force = new THREE.Vector3(0, 0, 0);
  }

  addForce(a: THREE.Vector3) {
    this.force.add(a);
  }

  initParticles() {
    const step = this.options.sizeWeights / (this.options.budCount + 1);
    const flexibleStep = (1 - this.options.flexible) / (this.options.budCount + 1);
    let nextFlexible = 1;
    this.particles.push(new Particle(0, 0, 0, 1));
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

    // 长度限制
    const lengthConstraints = this.lengthConstraints;

    for (let i = 0; i < lengthConstraints.length; i++) {
      const constraint = lengthConstraints[i];
      runLengthConstraints(constraint[0], constraint[1], constraint[2]);
    }

    // 固定根节点
    root.position.copy(root.original);
  }

  update() {
    this.updatePosition();
    this.runConstraint();
    const closedSpline = new THREE.CatmullRomCurve3(this.getPointsFromParticles());
    // @ts-ignore
    closedSpline.curveType = 'catmullrom';
    // @ts-ignore
    closedSpline.closed = false;
    this.extrudeSetting.extrudePath = closedSpline;

    this.geometry = new THREE.ExtrudeBufferGeometry(this.options.shape, this.extrudeSetting);
  }
}

import * as THREE from 'three';

export class Particle {
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

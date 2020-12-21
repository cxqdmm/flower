import * as THREE from 'three';
import { MathUtils } from 'three';
import { Branch } from './Branch';
import { Leaf } from './Leaf';

export class Flower {
  mesh: THREE.Object3D;
  branch: Branch;
  leaf: Leaf;
  constructor() {
    this.mesh = new THREE.Object3D();
    this.branch = this.createBranch();
    this.leaf = this.createLeaf();
    this.leaf.mesh.rotation.x = MathUtils.degToRad(30);
    this.init();
  }
  init() {
    this.mesh.add(this.branch.mesh);
    this.mesh.add(this.leaf.mesh);
    this.update();
  }

  createBranch() {
    return new Branch({ flexible: 0.6, budCount: 6, sizeWeights: 20 });
  }

  createLeaf() {
    return new Leaf();
  }

  update() {
    const stemNodes = this.branch.stemNodes;
    this.mesh.remove(this.branch.mesh);
    this.branch.update();
    this.mesh.add(this.branch.mesh);
    const position = stemNodes[6].position;
    this.leaf.mesh.position.copy(position);
  }
}

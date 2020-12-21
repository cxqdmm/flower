import * as THREE from 'three';

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

export class Leaf extends THREE.ShapeGeometry {
  mesh: THREE.Mesh<this, THREE.MeshBasicMaterial>;
  constructor() {
    const x = 0,
      y = 0;

    const heartShape = new THREE.Shape();

    heartShape.moveTo(x, y);
    heartShape.lineTo(x - 1, y + 4);
    heartShape.lineTo(x - 1, y + 6);
    heartShape.lineTo(x, y + 8);
    heartShape.lineTo(x + 1, y + 6);
    heartShape.lineTo(x + 1, y + 4);
    heartShape.lineTo(x, y);
    super(heartShape);
    this.mesh = new THREE.Mesh(this, material);
  }
}

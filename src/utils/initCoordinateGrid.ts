import * as THREE from 'three';

export function initCoordinateGrid(scene: THREE.Scene) {
  var geometry = new THREE.Geometry(); // geometry为三维空间中的点集同点集闭合后的各个面的集合
  // 在x轴上定义两个点p1(-500,0,0)，p2(500,0,0)。
  geometry.vertices.push(new THREE.Vector3(-200, 0, 0));
  geometry.vertices.push(new THREE.Vector3(200, 0, 0));
  // 思路：我们要画一个网格的坐标，那么我们就应该找到线的点。把网格虚拟成正方形，在正方形边界上找到几个等分点，用这些点两两连接，就能够画出整个网格来。
  for (var i = 0; i <= 20; i++) {
    // 这两个点决定了x轴上的一条线段，将这条线段复制20次，分别平行移动到z轴的不同位置，就能够形成一组平行的线段。
    // 同理，将p1p2这条线先围绕y轴旋转90度，然后再复制20份，平行于z轴移动到不同的位置，也能形成一组平行线。
    // 经过上面的步骤，就能够得到坐标网格了。
    var line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2 }),
    );
    line.position.z = i * 20 - 200;
    scene.add(line);

    var liney = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2 }),
    );
    liney.position.x = i * 20 - 200;
    liney.rotation.y = (90 * Math.PI) / 180; // 将线旋转90度
    scene.add(liney);
  }
}

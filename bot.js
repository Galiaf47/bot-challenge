
function updatePlayer(player, enemies) {
  let split = false;

  return {
    ...player,
    cells: player.cells ? player.cells.map(cell => {
      let dir = cell.dir;
      let velocity;

      const closest = enemies.sort((e1, e2) => (e1.pos.distance(cell.pos) - e2.pos.distance(cell.pos)))[0];

      if(closest.size < cell.size) {
        const distance = closest.pos.distance(cell.pos);
        dir = closest.pos.clone().subtract(cell.pos).normalize();
        velocity = 3;
        if (distance < cell.size * 4) {
          split = true;
        }
      } else {
        dir = closest.pos.clone().subtract(cell.pos).invert().normalize();
        velocity = 5;
      }

      if (cell.charge) velocity = 10;

      return {
        ...cell,
        dir,
        velocity,
      };
    }) : player.cells,
    split,
  };
}
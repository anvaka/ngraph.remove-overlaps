module.exports = removeOverlaps;

function removeOverlaps(layout, options) {
  if (!layout) throw new Error('layout argument is required');

  // This variable is used during iteration over quadTree
  var currentNode = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    body: null
  };

  options = options || {};

  var defaultSize = options.defaultSize || {
    width: 20,
    height: 20
  };

  var active = options.active !== undefined ? options.active : false;

  // we store amount of node movement into this variable.
  var totalMovement = 1;

  var physicsSimulator = layout.simulator;
  var graph = layout.graph;

  if (active) {
    layout.on('step', step);
    layout.on('disposed', dispose);
    layout.on('stable', removeAll);
  } else {
    removeAll();
  }

  // We will autodispose when layout is disposed. Just in case, giving a
  // reference for disposal
  return dispose;

  function dispose() {
    layout.off('step', step);
    layout.off('stable', removeAll);
    layout.off('disposed', dispose);
  }

  function removeAll() {
    while (totalMovement > 0) {
      runRemoveOverlapsIfNeeded();
    }
  }

  function step() {
    runRemoveOverlapsIfNeeded();
  }

  function runRemoveOverlapsIfNeeded() {
    var tree = physicsSimulator.quadTree;
    var root = tree.getRoot();
    totalMovement = 0;

    layout.forEachBody(function(body, graphNodeId) {
      var graphNode = graph.getNode(graphNodeId);

      currentNode.width = getWidth(graphNode.data);
      currentNode.height = getHeight(graphNode.data);
      currentNode.x = body.pos.x;
      currentNode.y = body.pos.y;
      currentNode.body = body;

      traverse(root, visitQuad);
    });
  }

  function visitQuad(quad) {
    var body = quad.body;
    if (body === currentNode.body) return false;

    if (body) {
      // Check if body needs to be moved;
      totalMovement += moveIfNeeded(body);
    } else {
      // we only continue subdividing the tree if current node intersects the quad
      return intersectQuad(quad)
    }
  }

  function getWidth(nodeData) {
    return (nodeData && nodeData.width) || defaultSize.width;
  }

  function getHeight(nodeData) {
    return (nodeData && nodeData.height) || defaultSize.height;
  }

  function moveIfNeeded(body) {
    var a = currentNode;
    var node = graph.getNode(body.id);

    var b = {
      x: body.pos.x,
      y: body.pos.y,
      width: getWidth(node.data),
      height: getHeight(node.data)
    }

    var ox = Math.min(a.x + a.width / 2, b.x + b.width / 2) - Math.max(a.x - a.width / 2, b.x - b.width / 2);
    var oy = Math.min(a.y + a.height / 2, b.y + b.height / 2) - Math.max(a.y - a.height / 2, b.y - b.height / 2);

    if (ox > 0 && oy > 0) {
      var totalMovement = move(ox, oy, a, b);
      currentNode.body.pos.x = a.x;
      currentNode.body.pos.y = a.y;

      body.pos.x = b.x;
      body.pos.y = b.y;

      return totalMovement;
    }

    return 0;
  }

  function move(ox, oy, a, b) {
    // shift along the axis of ideal/target positions
    // so boxes can cross each other rather than collide
    // this makes the result more predictable

    var vx0 = (a.x + a.width / 2) - (b.x + b.width / 2);
    var vy0 = (a.y + a.height / 2) - (b.y + b.width / 2),
      v0 = Math.sqrt(vx0 * vx0 + vy0 * vy0),
      shift = Math.sqrt(ox * oy),
      shiftX,
      shiftY;

    if (v0 !== 0) {
      vx0 /= v0;
      vy0 /= v0;
    } else {
      var phi = Math.random() * 2 * Math.PI;
      vx0 = Math.cos(phi);
      vy0 = Math.sin(phi);
    }

    shiftX = shift * vx0;
    shiftY = shift * vy0;

    a.x += shiftX;
    b.x -= shiftX;
    a.y += shiftY;
    b.y -= shiftY;

    return Math.abs(shiftX) + Math.abs(shiftY);
  }

  function intersectQuad(quad) {
    var xHalf = currentNode.width / 2;
    var yHalf = currentNode.height / 2;
    var left = currentNode.x - xHalf;
    var top = currentNode.y - yHalf;
    var right = currentNode.x + xHalf;
    var bottom = currentNode.y + yHalf;

    // Continue subdivision only if current rectangle intersects our quad
    // http://stackoverflow.com/questions/306316/determine-if-two-rectangles-overlap-each-other
    return left < quad.right &&
      right > quad.left &&
      top < quad.bottom &&
      bottom > quad.top;
  }
}

function traverse(quad, visitor) {
  if (visitor(quad)) {
    if (quad.quad0) traverse(quad.quad0, visitor)
    if (quad.quad1) traverse(quad.quad1, visitor)
    if (quad.quad2) traverse(quad.quad2, visitor)
    if (quad.quad3) traverse(quad.quad3, visitor)
  }
}

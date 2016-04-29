var createLayout = require('ngraph.forcelayout');
var createGraph = require('ngraph.graph')
var removeOverlaps = require('../')
var test = require('tap').test;

test('it can remove overlaps from force layout', function(t) {
  var width = 20;
  var graph = createGraph();
  var node1 = graph.addNode(1, {
    width: width,
    height: 1
  });
  node1.position = {
    x: -5,
    y: 0
  };

  var node2 = graph.addNode(2, {
    width: width,
    height: 1
  });
  node2.position = {
    x: 5,
    y: 0
  };

  var layout = createLayout(graph);

  layout.step();

  var bodies = [];
  layout.forEachBody(function (body) {
    bodies.push(body);
  });
  var dx = Math.abs(bodies[0].pos.x - bodies[1].pos.x);
  t.ok(dx < width, 'rectangles overlap at the beginning');

  // remove overlaps just once
  removeOverlaps(layout);

  dx = Math.abs(bodies[0].pos.x - bodies[1].pos.x);
  t.ok(dx >= width, 'but they do not after removeOverlaps() call');

  t.end();
});


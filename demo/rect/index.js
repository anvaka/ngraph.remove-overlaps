var createLayout = require('ngraph.forcelayout');
var createGraph = require('ngraph.graph')

var removeOverlaps = require('../../');

var graph = createGraph();
var nodesCount = 100;
var numberOfLinks = 100;

// To remove overlaps work, we need to make sure that each node has `width` and
// `height` attribute:
for (var i = 0; i < nodesCount; ++i) {
  graph.addNode(i, { width: 20, height: 20 });
}

randomlyConnectNodes();

// create regular ngraph.forceLayout instance.
var layout = createLayout(graph, {
    springLength : 75,
    springCoeff : 0.00055,
    dragCoeff : 0.09,
    gravity : -1
});

// removeOverlaps() comes in two flavors. By default it is fire and forget operation.
// It will perform one time overlaps removal, and will dispose itself:
//
// removeOverlaps(layout);

// In our case we need an "active mode" - where removeOverlaps monitors changes
// to layout and eliminates overlaps if layout changes. We need active mode here
// because we are using 'ngraph.svg' for rendering (which interactively updates layout)
removeOverlaps(layout, { active: true });

// that's it. removeOverlaps() in active mode will care about dynamic updates.
// Below is just rendering of the graph, but it has nothing to do with overlaps removal
renderGraph(graph);

function renderGraph(graph) {
  var render = require('ngraph.svg');
  var svg = render.svg;


  var renderer = render(graph, { layout: layout });

  renderer.node(createNode).placeNode(renderNode);

  renderer.run();

  function renderNode(ui, pos, node) {
    var x = pos.x - node.data.width/2;
    var y = pos.y - node.data.height/2;
    ui.attr('transform', 'translate(' + x + ',' + y + ')');
  }

  function createNode(node) {
    var ui = svg('g');
        // Create SVG text element with user id as content
    var rect = svg('rect', {
      width: node.data.width,
      height: node.data.height,
      stroke: '#fff',
      fill: '#ff00ef',
      'stroke-width': '1.5px'
    });
    ui.append(rect);

    return ui;
  }
}

function randomlyConnectNodes() {
  for (var i = 0; i < numberOfLinks; ++i) {
    var from, to;
    do {
      from = Math.floor(Math.random() * nodesCount);
      to = Math.floor(Math.random() * nodesCount);
    } while(from === to || graph.hasLink(from, to))
    graph.addLink(from, to)
  }
}

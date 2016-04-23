# ngraph.remove-overlaps

Removes overlaps between nodes in ngraph.forcelayout. [Demo](https://anvaka.github.io/ngraph.remove-overlaps/demo/rect/index.html)

# Usage

There are two ways how you can use `ngraph.remove-overlaps`. One option is
"fire-and-forget". In this mode remove overlaps will take whatever current state
of the system is, and will remove all overlaps between boxes:

``` js
var createLayout = require('ngraph.forcelayout')
var layout = createLayout(graph)

// let's say your layout ran for several iterations:
while(iterationsCount++ < MAX_ITERTIONS) {
  layout.step()
}

// If you want to remove overlaps just once:
var removeOverlaps = require('ngraph.remove-overlaps')
removeOverlaps(layout)
```

Alternatively, you may want to remove overlaps after every single layout iteration:

``` js
var removeOverlaps = require('ngraph.remove-overlaps')
var createLayout = require('ngraph.forcelayout')
var layout = createLayout(graph)

// run layout and overlap removal for several iterations:
while(iterationsCount++ < MAX_ITERTIONS) {
  layout.step()
  removeOverlaps(layout);
}
```

Or you can write the code more concisely like so:

``` js
var removeOverlaps = require('ngraph.remove-overlaps')
var createLayout = require('ngraph.forcelayout')
var layout = createLayout(graph)

// Thanks to {active: true} option, whever layout islchanged,
// the overlaps will be removed automatically:
removeOverlaps(layout, {active: true})

// let's say your layout ran for several iterations:
while(iterationsCount++ < MAX_ITERTIONS) {
  layout.step()
}
```

# license

MIT

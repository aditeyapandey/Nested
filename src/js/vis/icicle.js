(function () {
  icicle = {};
  // Copyright 2021 Observable, Inc.
  // Released under the ISC license.
  // https://observablehq.com/@d3/icicle
  icicle.createIcicle = function (
    data,
    {
      // data is either tabular (array of objects) or hierarchy (nested objects)
      path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
      id = Array.isArray(data) ? (d) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
      parentId = Array.isArray(data) ? (d) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
      children, // if hierarchical data, given a d in data, returns its children
      format = ",", // format specifier string or function for values
      value, // given a node d, returns a quantitative value (for area encoding; null for count)
      sort = (a, b) => d3.descending(a.label, b.label),
      //sort = (a, b) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
      label, // given a node d, returns the name to display on the rectangle
      link, // given a node d, its link (if any)
      linkTarget = "_blank", // the target attribute for links (if any)
      width = 640, // outer width, in pixels
      height = 400, // outer height, in pixels
      margin = 0, // shorthand for margins
      marginTop = margin, // top margin, in pixels
      marginRight = margin, // right margin, in pixels
      marginBottom = margin, // bottom margin, in pixels
      marginLeft = margin, // left margin, in pixels
      padding = 1, // cell padding, in pixels
      round = false, // whether to round to exact pixels
      color = d3.interpolateRainbow, // color scheme, if any
      fill = "#ccc", // fill for node rects (if no color encoding)
      fillOpacity = 0.6, // fill opacity for node rects
      highlightAncestors = true,
      highlightDescendants = false, //Test if a node has ancestors
      highlightSiblings = false, //Enable siblings interaction
      highlightChildNodes = false,
      highlightPath = false,
      interactions = {
        highlightNode: false,
        highlightAncestors: false,
        highlightDescendants: false,
        highlightSiblings: false,
        highlightChildNodes: false,
        highlightPath: false,
      },
      options = {
        ancestors: true,
        nodeValue: { status: true },
        size: true,
        height: true,
        depth: true,
        degree: true,
      },
    } = {}
  ) {
    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    const root =
      path != null
        ? d3.stratify().path(path)(data)
        : id != null || parentId != null
        ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children).eachBefore((d, i) => (d.index = i++));

    // Compute the values of internal nodes by aggregating from the leaves.
    value == null ? root.count() : root.sum((d) => Math.max(0, value(d)));
    const title = function (d, n) {
      let combinedString = [];
      combinedString.push(
        `Hierarchy: ${n
          .ancestors()
          .reverse()
          .map((d) => d.data.name)
          .join(".")}`
      ); // hover text
      combinedString.push(`Value: ${n.value}`); // hover text
      let finalResult = combinedString.join("\n");
      return finalResult;
    };

    // Compute formats.
    if (typeof format !== "function") format = d3.format(format);

    // Sort the leaves (typically by descending value for a pleasing layout).
    if (sort != null) root.sort(sort);

    // Compute the partition layout. Note that x and y are swapped!
    d3
      .partition()
      .size([
        height - marginTop - marginBottom,
        width - marginLeft - marginRight,
      ])
      .padding(padding)
      .round(round)(root);

    // Construct a color scale.
    if (color != null) {
      color = d3
        .scaleSequential([0, root.children.length - 1], color)
        .unknown(fill);
      root.children.forEach((child, i) => (child.index = i));
    }

    const svg = d3
      .create("svg")
      .attr("viewBox", [-marginLeft, -marginTop, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    const cell = svg
      .selectAll("a")
      .data(root.descendants())
      .join("a")
      .attr("class", "node")
      .attr("id", (d) => `node_${d.index}_${d.depth}`)
      .attr("xlink:href", link == null ? null : (d) => link(d.data, d))
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", (d) => `translate(${d.y0},${d.x0})`)
      .on("mouseover", (e, d) => {
        //icicle.highlightNode(`node_${d.index}_${d.depth}`, "select");

        if (interactions.highlightNode) {
          interaction.highlightNodeWithLinks(
            `node_${d.index}_${d.depth}`,
            "select"
          );
        }
        // Highlight Ancestors
        if (interactions.highlightAncestors) {
          let ancestors = d.ancestors();
          interaction.highlightAncestorsWithNoLinks(
            `node_${d.index}_${d.depth}`,
            ancestors,
            "select"
          );
        }
        //Highlight descendants
        if (interactions.highlightDescendants) {
          console.log("coming here");
          let descendants = d.descendants();
          interaction.highlightDescendantsNoLink(descendants, "select");
        }
        //Highlight Siblings
        if (interactions.highlightSiblings) {
          let parent = d.parent;
          let parentDescendants = d.parent.descendants();
          let siblingNodes = parentDescendants.filter(
            (d) => d.parent === parent
          );
          console.log(siblingNodes);
          interaction.highlightSiblingsWithNoLinks(siblingNodes, "select");
        }
        //Highlight Child Nodes
        if (interactions.highlightChildNodes) {
          let descendants = d.descendants();
          let nodeName = d.data.name;
          let childNodes = descendants.filter((d) => {
            if (d.parent !== null) {
              return (
                d.parent.data.name === nodeName || d.data.name === nodeName
              );
            } else {
              return d;
            }
          });
          interaction.highlightDescendantsNoLink(childNodes, "select");
        }
        if (interactions.highlightPath) {
          interaction.highlightPathWithNoLinks(
            d.path(root.find((node) => node.data.name === "interpolate")),
            "select"
          );
        }
      })
      .on("mouseout", function (e, d) {
        if (interactions.highlightNode) {
          interaction.highlightNodeWithLinks(
            `node_${d.index}_${d.depth}`,
            "deselect"
          );
        }

        // UnHighlight Ancestors
        if (interactions.highlightAncestors) {
          interaction.highlightAncestors(
            `node_${d.index}_${d.depth}`,
            [],
            "deselect"
          );
        }

        //UnHighlight Descendants
        if (interactions.highlightSiblings) {
          interaction.highlightSiblingsWithNoLinks([], "deselect");
        }
        if (interactions.highlightChildNodes) {
          interaction.highlightDescendantsNoLink([], "deselect");
        }
        if (interactions.highlightPath) {
          interaction.highlightPathWithNoLinks([], "deselect");
        }
      });

    cell
      .append("rect")
      .attr("width", (d) => d.y1 - d.y0)
      .attr("height", (d) => d.x1 - d.x0)
      .attr("fill", "#ddd")
      // .attr(
      //   "fill",
      //   color ? (d) => color(d.ancestors().reverse()[1]?.index) : fill
      // )
      .attr("fill-opacity", fillOpacity);

    const text = cell
      .filter((d) => d.x1 - d.x0 > 10)
      .append("text")
      .attr("x", 4)
      .attr("y", (d) => Math.min(9, (d.x1 - d.x0) / 2))
      .attr("dy", "0.32em");

    if (label != null) text.append("tspan").text((d) => label(d.data, d));

    text
      .append("tspan")
      .attr("fill-opacity", 0.7)
      .attr("dx", label == null ? null : 3)
      .text((d) => format(d.value));

    if (title != null)
      cell.append("title").text((d) => interaction.appendTitle(d, options));

    return svg.node();
  };

  icicle.highlightNode = function (id, event) {
    if (event === "select") {
      d3.selectAll(".node").style("opacity", "0.2");
      d3.selectAll(".link").style("opacity", "0.2");
      d3.selectAll("#" + id).style("opacity", "1");
      // var top = $("#" + id).position().top - 400;
      // console.log(top);
      // $("#visOutput").animate({ scrollTop: top + "px" }, 1000);
    } else {
      d3.selectAll(".node").style("opacity", "1");
      d3.selectAll(".link").style("opacity", "1");
    }
  };
})();

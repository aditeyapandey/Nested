(function () {
  radialNodeLink = {};

  radialNodeLink.createChart = function (
    data,
    {
      // data is either tabular (array of objects) or hierarchy (nested objects)
      path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
      id = Array.isArray(data) ? (d) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
      parentId = Array.isArray(data) ? (d) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
      children, // if hierarchical data, given a d in data, returns its children
      tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
      separation = tree === d3.tree
        ? (a, b) => (a.parent == b.parent ? 1 : 2) / a.depth
        : (a, b) => (a.parent == b.parent ? 1 : 2),
      sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
      label, // given a node d, returns the display name
      link, // given a node d, its link (if any)
      linkTarget = "_blank", // the target attribute for links (if any)
      width = 640, // outer width, in pixels
      height = 400, // outer height, in pixels
      margin = 60, // shorthand for margins
      marginTop = margin, // top margin, in pixels
      marginRight = margin, // right margin, in pixels
      marginBottom = margin, // bottom margin, in pixels
      marginLeft = margin, // left margin, in pixels
      radius = Math.min(
        width - marginLeft - marginRight,
        height - marginTop - marginBottom
      ) / 2, // outer radius
      r = 3, // radius of nodes
      padding = 1, // horizontal padding for first and last column
      fill = "#999", // fill for nodes
      fillOpacity, // fill opacity for nodes
      stroke = "#555", // stroke for links
      strokeWidth = 1.5, // stroke width for links
      strokeOpacity = 0.4, // stroke opacity for links
      strokeLinejoin, // stroke line join for links
      strokeLinecap, // stroke line cap for links
      halo = "#fff", // color of label halo
      haloWidth = 3, // padding around the labels
      highlightAncestors = true, //Test if a node has ancestors
      highlightDescendants = false, //Test if a node has ancestors
      highlightSiblings = false, //Enable siblings interaction
      highlightChildNodes = false, //Enable child node interaction
      highlightPath = false, //Enable path selection between two nodes
      interactions = {
        highlightNode:false,
        highlightAncestors:false,
        highlightDescendants:false,
        highlightSiblings:false,
        highlightChildNodes:false,
        highlightPath:false
      },
      options = {
        ancestors: true,
        nodeValue: { status: true },
        size: true,
        height: true,
        depth: true,
        degree: true,
      },
      value
    }
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

    //data
    value == null ? root.count() : root.sum((d) => Math.max(0, value(d)));
    console.log(root);

    // Sort the nodes.
    if (sort != null) root.sort(sort);

    // Compute labels and titles.
    const descendants = root.descendants();
    const L = label == null ? null : descendants.map((d) => label(d.data, d));

    // Compute the layout.
    tree()
      .size([2 * Math.PI, radius])
      .separation(separation)(root);

    const svg = d3
      .create("svg")
      .attr("viewBox", [
        -marginLeft - radius,
        -marginTop - radius,
        width,
        height,
      ])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", stroke)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-linecap", strokeLinecap)
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("stroke-width", strokeWidth)
      .attr("transform", `translate(${margin},${margin})`)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("id", (d) => {
        return `node_${d.source.index}-node_${d.target.index}`;
      })
      .attr(
        "d",
        d3
          .linkRadial()
          .angle((d) => d.x)
          .radius((d) => d.y)
      );

    const node = svg
      .append("g")
      .attr("transform", `translate(${margin},${margin})`)
      .selectAll("a")
      .data(root.descendants())
      .join("a")
      .attr("xlink:href", link == null ? null : (d) => link(d.data, d))
      .attr("target", link == null ? null : linkTarget)
      .attr(
        "transform",
        (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
      )
      .attr("id", (d) => "node_" + d.index)
      .attr("class", "node")
      .on("mouseover", (e, d) => {
        console.log("test")

        if (interactions.highlightNode) {
          console.log("test")
          interaction.highlightNodeWithLinks("node_" + d.index, "select");
        }
        if (interactions.highlightAncestors) {
          let ancestors = d.ancestors();
          interaction.highlightAncestors("node_" + d.index, ancestors, "select");
        }
        if (interactions.highlightDescendants) {
            let descendants = d.descendants();
            interaction.highlightDescendantsWithLinks(descendants, "select");
          }
        if (interactions.highlightSiblings) {
          let parent = d.parent;
          console.log(parent);
          let parentDescendants = d.parent.descendants();
          let siblingNodes = parentDescendants.filter(
            (d) => d.parent === parent
          );
          console.log(siblingNodes);
          interaction.highlightSiblings(siblingNodes, "select");
        }
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
          interaction.highlightDescendantsWithLinks(childNodes, "select");
        }
        if (interactions.highlightPath) {
          interaction.highlightPath(
            d.path(root.find((node) => node.data.name === "interpolate")),
            "select"
          );
        }
      })
      .on("mouseout", function (e, d) {

        if (interactions.highlightNode) {
          interaction.highlightNodeWithLinks("node_" + d.index, "deselect");
        }
        if (interactions.highlightAncestors) {
            interaction.highlightAncestors("node_" + d.index, [], "deselect");
        }
        if (interactions.highlightDescendants) {
            interaction.highlightDescendantsWithLinks([], "deselect");
          }
        if (interactions.highlightSiblings) {
          interaction.highlightSiblings([], "deselect");
        }
        if (interactions.highlightChildNodes) {
          interaction.highlightDescendantsWithLinks([], "deselect");
        }
        if (interactions.highlightPath) {
          interaction.highlightPath([], "deselect");
        }
      });

    node
      .append("circle")
      .attr("fill", (d) => (d.children ? stroke : fill))
      .attr("r", r);

    node.append("title").text((d) => interaction.appendTitle(d, options));

    if (L)
      node
        .append("text")
        .attr("transform", (d) => `rotate(${d.x >= Math.PI ? 180 : 0})`)
        .attr("dy", "0.32em")
        .attr("x", (d) => (d.x < Math.PI === !d.children ? 6 : -6))
        .attr("text-anchor", (d) =>
          d.x < Math.PI === !d.children ? "start" : "end"
        )
        .attr("paint-order", "stroke")
        .attr("font-size", "12px")
        //         .attr("fill", d => {
        //   console.log(d)
        //   if(d.data.name === "legend" || d.data.name === "converters" )
        //   {return "#800000"}
        //   })
        .attr("stroke-width", haloWidth)
        .text((d, i) => L[i]);

    return svg.node();
  };

  radialNodeLink.highlightNode = function (id, event) {
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

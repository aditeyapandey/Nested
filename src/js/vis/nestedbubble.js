(function () {
  nestedBubble = {};
  nestedBubble.createChart = function (
    data,
    {
      // data is either tabular (array of objects) or hierarchy (nested objects)
      path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
      id = Array.isArray(data) ? (d) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
      parentId = Array.isArray(data) ? (d) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
      children, // if hierarchical data, given a d in data, returns its children
      value, // given a node d, returns a quantitative value (for area encoding; null for count)
      sort = (a, b) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
      label, // given a leaf node d, returns the display name
      // title, // given a node d, returns its hover text
      link, // given a node d, its link (if any)
      linkTarget = "_blank", // the target attribute for links, if any
      width = 640, // outer width, in pixels
      height = 400, // outer height, in pixels
      margin = 1, // shorthand for margins
      marginTop = margin, // top margin, in pixels
      marginRight = margin, // right margin, in pixels
      marginBottom = margin, // bottom margin, in pixels
      marginLeft = margin, // left margin, in pixels
      padding = 3, // separation between circles
      fill = "#ddd", // fill for leaf circles
      fillOpacity, // fill opacity for leaf circles
      stroke = "#bbb", // stroke for internal circles
      strokeWidth, // stroke width for internal circles
      strokeOpacity, // stroke opacity for internal circles
      colorScale = d3.interpolateGreys, // color scheme, if any
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

    // Compute labels and titles.
    const descendants = root.descendants();
    const leaves = descendants.filter((d) => !d.children);
    leaves.forEach((d, i) => (d.index = i));
    const L = label == null ? null : leaves.map((d) => label(d.data, d));

    // Sort the leaves (typically by descending value for a pleasing layout).
    if (sort != null) root.sort(sort);

    // Compute the layout.
    d3
      .pack()
      .size([
        width - marginLeft - marginRight,
        height - marginTop - marginBottom,
      ])
      .padding(padding)(root);

    const color = d3.scaleSequential([0, 8], colorScale);

    const svg = d3
      .create("svg")
      .attr("viewBox", [-marginLeft, -marginTop, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle");

    const node = svg
      .selectAll("a")
      .data(descendants)
      .join("a")
      .attr("xlink:href", link == null ? null : (d, i) => link(d.data, d))
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .attr("class", "node")
      .attr("id", (d) => `node_${d.index}_${d.depth}`)
      .on("mouseover", (e, d) => {
        //nestedBubble.highlightNode(`node_${d.index}_${d.depth}`, "select");
        if (interactions.highlightNode) {
          interaction.highlightNodeWithLinks(
            `node_${d.index}_${d.depth}`,
            "select"
          );
        }
        if (interactions.highlightAncestors) {
          let ancestors = d.ancestors();
          interaction.highlightAncestorsWithNoLinks(
            `node_${d.index}_${d.depth}`,
            ancestors,
            "select"
          );
        }
        if (interactions.highlightDescendants) {
          let descendants = d.descendants();
          interaction.highlightDescendantsNoLink(descendants, "select");
        }
        if (interactions.highlightDescendants) {
          let parent = d.parent;
          let parentDescendants = d.parent.descendants();
          let siblingNodes = parentDescendants.filter(
            (d) => d.parent === parent
          );
          console.log(siblingNodes);
          interaction.highlightSiblingsWithNoLinks(siblingNodes, "select");
        }
        if (interactions.highlightDescendants) {
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
        if (interactions.highlightDescendants) {
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
        if (interactions.highlightAncestors) {
          interaction.highlightAncestorsWithNoLinks(
            `node_${d.index}_${d.depth}`,
            [],
            "deselect"
          );
        }
        if (interactions.highlightDescendants) {
          interaction.highlightDescendantsNoLink([], "deselect");
        }
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

    node
      .append("circle")
      .attr("fill", (d) => color(d.height))
      //.attr("fill", "white")
      .attr("fill-opacity", (d) => (d.children ? null : fillOpacity))
      // .attr("stroke", d => d.children ? stroke : null)
      .attr("stroke", (d) => stroke)
      .attr("stroke-width", (d) => (d.children ? strokeWidth : null))
      .attr("stroke-opacity", (d) => (d.children ? strokeOpacity : null))
      .attr("r", (d) => d.r);

    node.append("title").text((d) => interaction.appendTitle(d, options));

    if (L) {
      // A unique identifier for clip paths (to avoid conflicts).
      const uid = `O-${Math.random().toString(16).slice(2)}`;

      const leaf = node.filter(
        (d) => !d.children && d.r > 10 && L[d.index] != null
      );

      leaf
        .append("clipPath")
        .attr("id", (d) => `${uid}-clip-${d.index}`)
        .append("circle")
        .attr("r", (d) => d.r);

      leaf
        .append("text")
        .attr(
          "clip-path",
          (d) => `url(${new URL(`#${uid}-clip-${d.index}`, location)})`
        )
        .selectAll("tspan")
        .data((d) => `${L[d.index]}`.split(/\n/g))
        .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
        .attr("fill-opacity", (d, i, D) => (i === D.length - 1 ? 0.7 : null))
        .text((d) => d);

      const groupLabel = svg
        .append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .attr("font-size", "12px")
        .attr("class", "node")
        .attr("id", (d) => `node_${d.index}_${d.depth}`)
        .text((d) => {
          return d.height > 0 ? d.data.name : "";
        });

      groupLabel
        .attr("transform", (d) => `translate(${d.x}, ${d.y - d.r})`)
        .attr("dy", "-0.25em")
        .clone(true)
        .lower()
        .attr("aria-hidden", "true")
        .attr("fill", "black")
        .attr("font-size", "12px");
    }
    return svg.node();
  };
  nestedBubble.highlightNode = function (id, event) {
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
  nestedBubble.highlightAncestors = function (id, ancestors, event) {
    if (event === "select") {
      d3.selectAll(".node").transition().duration("50").style("opacity", "0.1");
      // d3.selectAll(".link").transition().duration("50").style("opacity", ".1");

      d3.selectAll("#" + id)
        .transition()
        .duration("100")
        .style("opacity", "1");
      ancestors.forEach((val) => {
        d3.selectAll(`#node_${val.index}_${val.depth}`)
          .transition()
          .duration("100")
          .style("opacity", "1");
      });
    } else {
      d3.selectAll(".node").transition().duration("50").style("opacity", "1");
    }
  };
})();

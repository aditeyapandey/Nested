(function () {
  indentedList = {};

  indentedList.createIndentedList = function (
    data,
    {
      path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
      id = Array.isArray(data) ? (d) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
      parentId = Array.isArray(data) ? (d) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
      children, // if hierarchical data, given a d in data, returns its children
      width = 1152, // outer width, in pixels
      height = 1000, // outer height, in pixels
      nodeSize = 17, // size of node
      fontSize = 12, // set font size
      fontFamily = "sans-serif", // font style
      fill = "none", // fill for nodes
      fillOpacity, // fill opacity for nodes
      stroke = "#555", // stroke for links
      highlightAncestors = true,
      highlightDescendants = false, //Test if a node has ancestors
      highlightSiblings = false, //Enable siblings interaction
      highlightChildNodes = false, //Enable child node interaction
      highlightPath = false, //Enable path selection between two nodes
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
    }
  ) {
    root = d3.hierarchy(data).eachBefore((d, i) => (d.index = i++));
    const nodes = root.descendants();

    const svg = d3
      .create("svg")
      .attr("viewBox", [
        -nodeSize / 2,
        (-nodeSize * 3) / 2,
        width,
        (nodes.length + 1) * nodeSize,
      ])
      .attr("font-family", fontFamily)
      .attr("font-size", fontSize)
      .style("overflow", "visible");

    const link = svg
      .append("g")
      .attr("fill", fill)
      .attr("stroke", stroke)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("id", (d) => {
        return `node_${d.source.index}-node_${d.target.index}`;
      })
      .attr(
        "d",
        (d) => `
          M${d.source.depth * nodeSize},${d.source.index * nodeSize}
          V${d.target.index * nodeSize}
          h${nodeSize}
        `
      );

    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", (d) => `translate(0,${d.index * nodeSize})`);

    node
      .append("circle")
      .attr("cx", (d) => d.depth * nodeSize)
      .attr("r", 2.5)
      .attr("fill", (d) => (d.children ? null : "#999"))
      .attr("id", (d) => "node_" + d.index)
      .attr("class", "node");

    node
      .append("text")
      .attr("dy", "0.32em")
      .attr("x", (d) => d.depth * nodeSize + 6)
      .attr("id", (d) => "node_" + d.index)
      .attr("class", "node")
      .text((d) => d.data.name)
      .on("mouseover", (e, d) => {
        if (interactions.highlightNode)
          interaction.highlightNodeWithLinks("node_" + d.index, "select");

        if (interactions.highlightAncestors) {
          let ancestors = d.ancestors();
          interaction.highlightAncestors(
            "node_" + d.index,
            ancestors,
            "select"
          );
        }
        if (interactions.highlightDescendants) {
          let descendants = d.descendants();
          interaction.highlightDescendantsWithLinks(descendants, "select");
        }
        if (interactions.highlightSiblings) {
          let parent = d.parent;
          let parentDescendants = d.parent.descendants();
          let siblingNodes = parentDescendants.filter(
            (d) => d.parent === parent
          );
          interaction.highlightSiblingsWithLinks(siblingNodes, "select");
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
        if (interactions.highlightNode)
          interaction.highlightNodeWithLinks("node_" + d.index, "deselect");

        if (interactions.highlightAncestors) {
          interaction.highlightAncestors("node_" + d.index, [], "deselect");
        }
        if (interactions.highlightDescendants) {
          interaction.highlightDescendantsWithLinks([], "deselect");
        }
        if (interactions.highlightSiblings) {
          interaction.highlightSiblingsWithLinks([], "deselect");
        }
        if (interactions.highlightChildNodes) {
          interaction.highlightDescendantsWithLinks([], "deselect");
        }
        if (interactions.highlightPath) {
          interaction.highlightPath([], "deselect");
        }
      });

    node.append("title").text((d) => interaction.appendTitle(d, options));

    format = d3.format(",");
    let columns = [
      {
        label: "Size",
        value: (d) => d.value,
        format,
        x: 340,
      },
    ];
    for (const { label, value, format, x } of columns) {
      svg
        .append("text")
        .attr("dy", "0.32em")
        .attr("y", -nodeSize)
        .attr("x", x)
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .text(label);

      node
        .append("text")
        .attr("dy", "0.32em")
        .attr("x", x)
        .attr("text-anchor", "end")
        .attr("id", (d) => "node_" + d.index)
        .attr("class", "node")
        .attr("fill", (d) => (d.children ? null : "#555"))
        .data(root.copy().sum(value).descendants())
        .text((d) => format(d.value, d));
    }

    return svg.node();
  };

  // indentedList.highlightNode = function (id, event) {
  //   if (event === "select") {
  //     d3.selectAll(".node").style("opacity", "0.2");
  //     d3.selectAll(".link").style("opacity", "0.2");
  //     d3.selectAll("#" + id).style("opacity", "1");
  //     // var top = $("#" + id).position().top - 400;
  //     // console.log(top);
  //     // $("#visOutput").animate({ scrollTop: top + "px" }, 1000);
  //   } else {
  //     d3.selectAll(".node").style("opacity", "1");
  //     d3.selectAll(".link").style("opacity", "1");
  //   }
  // };
})();

(function () {
  dendrogram = {};

  dendrogram.createDendrogram = // Copyright 2021 Observable, Inc.
    // Released under the ISC license.
    // https://observablehq.com/@d3/tree
    function (
      data,
      {
        // data is either tabular (array of objects) or hierarchy (nested objects)
        path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
        id = Array.isArray(data) ? (d) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
        parentId = Array.isArray(data) ? (d) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
        children, // if hierarchical data, given a d in data, returns its children
        tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
        sort = (a, b) => d3.descending(a.label, b.label), // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
        label, // given a node d, returns the display name
        // title, // given a node d, returns its hover text
        link, // given a node d, its link (if any)
        linkTarget = "_blank", // the target attribute for links (if any)
        width = 640, // outer width, in pixels
        height, // outer height, in pixels
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
        color = null, // color scheme, if any
        value, //
        interactions = {
          highlightNode:false,
          highlightAncestors:false,
          highlightDescendant:false,
          highlightSiblings:false,
          highlightChildNodes:false,
          highlightPath:false
        },
        highlightNode = false,
        highlightAncestors = true, //Test if a node has ancestors
        highlightDescendants = false, //Test if a node has ancestors
        highlightSiblings = false, //Enable siblings interaction
        highlightChildNodes = false, //Enable child node interaction
        highlightPath = false, //Enable path selection between two nodes
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

      //data
      value == null ? root.count() : root.sum((d) => Math.max(0, value(d)));
      console.log(root);

      // Sort the nodes.
      if (sort != null) root.sort(sort);

      // Compute labels and titles.
      const descendants = root.descendants();
      const L = label == null ? null : descendants.map((d) => label(d.data, d));

      // Compute the layout.
      const dx = 10;
      const dy = width / (root.height + padding);
      tree().nodeSize([dx, dy])(root);

      // Center the tree.
      let x0 = Infinity;
      let x1 = -x0;
      root.each((d) => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
      });

      // Compute the default height.
      if (height === undefined) height = x1 - x0 + dx * 2;

      // Construct a color scale.
      if (color != null) {
        color = d3
          .scaleSequential([0, root.children.length - 1], color)
          .unknown(fill);
        root.children.forEach((child, i) => (child.index = i));
      }

      const svg = d3
        .create("svg")
        .attr("viewBox", [(-dy * padding) / 2, x0 - dx, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

      const svgGroup = svg.append("g").attr("id", "svgVisGroup");

      svgGroup
        .append("g")
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)
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
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        );

      const node = svgGroup
        .append("g")
        .selectAll("a")
        .data(root.descendants())
        .join("a")
        .attr("id", (d) => "node_" + d.index)
        .attr("class", "node")
        .attr("xlink:href", link == null ? null : (d) => link(d.data, d))
        .attr("target", link == null ? null : linkTarget)
        .attr("transform", (d) => `translate(${d.y},${d.x})`)
        .on("mouseover", (e, d) => {
          if (interactions.highlightNode) {
            interaction.highlightNodeWithLinks("node_" + d.index, "select");
          }
          //dendrogram.highlightNode("node_"+d.index, "select");

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
            interaction.highlightSiblingsWithLinks([], "deselect");
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
        .attr(
          "fill",
          color ? (d) => color(d.ancestors().reverse()[1]?.index) : fill
        )
        .attr("r", r);

      node.append("title").text((d) => interaction.appendTitle(d, options));

      if (L)
        node
          .append("text")
          .attr("dy", "0.32em")
          .attr("x", (d) => (d.children ? -6 : 6))
          .attr("text-anchor", (d) => (d.children ? "end" : "start"))
          .attr("paint-order", "stroke")
          .attr("stroke", halo)
          .attr("stroke-width", haloWidth)
          .text((d, i) => L[i]);

      // //Test out the info table
      // infoTable.createCompareTable();
      // infoTable.populateCompareTable();

      return svg.node();
    };

  dendrogram.searchLabelInteraction = function (searchTerm) {
    if (searchTerm === "") {
      d3.selectAll(".node").style("opacity", "1");
      d3.selectAll(".link").style("opacity", "1");
    } else {
      d3.selectAll(".node").style("opacity", "0.2");
      d3.selectAll(".link").style("opacity", "0.2");
      d3.selectAll("#" + searchTerm).style("opacity", "1");
      var top = $("#" + searchTerm).position().top - 400;
      console.log(top);
      $("#visOutput").animate({ scrollTop: top + "px" }, 1000);
    }
  };
})();

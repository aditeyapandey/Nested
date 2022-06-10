(function () {
  sunburst = {};

  sunburst.createChart = function (
    data,
    {
      path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
      id = Array.isArray(data) ? (d) => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
      parentId = Array.isArray(data) ? (d) => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
      children, // if hierarchical data, given a d in data, returns its children
      value, // given a node d, returns a quantitative value (for area encoding; null for count)
      sort = (a, b) => d3.descending(a.value, b.value), // how to sort nodes prior to layout
      label, // given a node d, returns the name to display on the rectangle
      link, // given a node d, its link (if any)
      linkTarget = "_blank", // the target attribute for links (if any)
      width = 640, // outer width, in pixels
      height = 400, // outer height, in pixels
      margin = 1, // shorthand for margins
      marginTop = margin, // top margin, in pixels
      marginRight = margin, // right margin, in pixels
      marginBottom = margin, // bottom margin, in pixels
      marginLeft = margin, // left margin, in pixels
      padding = 1, // separation between arcs
      radius = Math.min(
        width - marginLeft - marginRight,
        height - marginTop - marginBottom
      ) / 2, // outer radius
      color = d3.interpolateRainbow, // color scheme, if any
      fill = "#ccc", // fill for arcs (if no color encoding)
      fillOpacity = 0.6, // fill opacity for arcs
      highlightAncestors = true,
      highlightDescendants = false,
      highlightSiblings = false, //Enable siblings interaction
      highlightChildNodes = false,
      highlightPath = false,
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

    //Compute Titles
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
    // Sort the leaves (typically by descending value for a pleasing layout).
    if (sort != null) root.sort(sort);

    // Compute the partition layout. Note polar coordinates: x is angle and y is radius.
    d3.partition().size([2 * Math.PI, radius])(root);

    // Construct a color scale.
    if (color != null) {
      color = d3
        .scaleSequential([0, root.children.length - 1], color)
        .unknown(fill);
      root.children.forEach((child, i) => (child.index = i));
    }

    // Construct an arc generator.
    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, (2 * padding) / radius))
      .padRadius(radius / 2)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1 - padding);

    const svg = d3
      .create("svg")
      .attr("viewBox", [
        marginRight - marginLeft - width / 2,
        marginBottom - marginTop - height / 2,
        width,
        height,
      ])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "middle");

    const cell = svg
      .selectAll("a")
      .data(root.descendants())
      .join("a")
      .attr("xlink:href", link == null ? null : (d) => link(d.data, d))
      .attr("target", link == null ? null : linkTarget)
      .attr("class", "node")
      .attr("id", (d) => `node_${d.index}_${d.depth}`)
      .on("mouseover", (e, d) => {
        //sunburst.highlightNode(`node_${d.index}_${d.depth}`, "select");
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

        // if (highlightDescendants) {
        //   let descendants = d.descendants();
        //   interaction.highlightDescendantsNoLink(descendants, "select");
        // }
        //Highlight Siblings
        if (interactions.highlightSiblings) {
          let parent = d.parent;
          let parentDescendants = d.parent.descendants();
          let siblingNodes = parentDescendants.filter(
            (d) => d.parent === parent
          );
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
        // sunburst.highlightNode(`node_${d.index}_${d.depth}`, "deselect");
       
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
        // if (highlightDescendants) {
        //   interaction.highlightDescendantsNoLink([], "deselect");
        // }
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
      .append("path")
      .attr("d", arc)
      .attr("fill", "#ddd")
      // .attr("stroke", d => {
      //   console.log(d)
      //   if(d.data.name === "vis" || d.data.name === "animate" )
      //   {return "#800000"}
      //   })
      // .attr("fill", color ? d => color(d.ancestors().reverse()[1]?.index) : fill)
      .attr("fill-opacity", fillOpacity);

    if (label != null)
      cell
        .filter((d) => ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10)
        .append("text")
        .attr("transform", (d) => {
          if (!d.depth) return;
          const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
          const y = (d.y0 + d.y1) / 2;
          return `rotate(${x - 90}) translate(${y},0) rotate(${
            x < 180 ? 0 : 180
          })`;
        })
        .attr("dy", "0.32em")
        .attr("font-size", "12px")
        // .attr("fill", (d) => {
        //   console.log(d);
        //   if (d.data.name === "DataList") {
        //     return "#800000";
        //   }
        // })
        .text((d) => label(d.data, d));

    if (title != null)
      cell.append("title").text((d) => interaction.appendTitle(d, options));

    return svg.node();
  };

  sunburst.highlightNode = function (id, event) {
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

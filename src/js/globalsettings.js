//Attributes Added dynamically
// dataSummary
// data
// tasks
var GLOBALDATA = {
  panelWidth: {
    dataPanel: 12.5,
    taskPanel: 42.5,
    recommendationPanel: 45,
  },
  files: {
    flare: {
      fileName: "flare.json",
      label: "Flare",
      isVal: true,
      values: [
        { label: "Degree", attrName: "Degree" },
        { label: "Value", attrName: "value" },
      ],
      isHierarchy: true,
      additionalAttr: false,
      data: [],
    },
    royalFamily: {
      fileName: "british_royal_family.json",
      label: "British Royal Family",
      isVal: false,
      values: [{ label: "Degree", attrName: "Degree" }],
      isHierarchy: true,
      additionalAttr: true,
      data: [],
    },
    superstore: {
      fileName: "superstoreFlorida.json",
      label: "Superstore",
      isVal: true,
      values: [
        { label: "Degree", attrName: "Degree" },
        { label: "Sales", attrName: "Sales" },
        { label: "Quantity", attrName: "Quantity" },
        { label: "Profit", attrName: "Profit" },
      ],
      isHierarchy: false,
      hierarchy: ["Segment", "Category", "Sub-Category"],
      additionalAttr: true,
      data: [],
    },
    upload: {
      fileName: "",
      label: "",
      isVal: true,
      values: [
        { label: "Degree", attrName: "Degree" },
        { label: "Value", attrName: "value" },
      ],
      isHierarchy: true,
      additionalAttr: true,
      data: [],
    },
  },
  visContainer: {
    width: 600,
    height: 600,
  },
  currentFile: "",
  currentVis: "",
  imgMap: {
    tree: {
      nodelink: {
        fileName: "NL.png",
        label: "Node-Link",
        relativePath: "treeimg/",
      },
      icicle: {
        fileName: "LD.png",
        label: "Icicle Plot",
        relativePath: "treeimg/",
      },
      treemap: {
        fileName: "ED.png",
        label: "Treemap",
        relativePath: "treeimg/",
      },
      indented: {
        fileName: "IL.png",
        label: "Indented List",
        relativePath: "treeimg/",
      },
      radialNL: {
        fileName: "RNL.png",
        label: "Radial Node-Link",
        relativePath: "treeimg/",
      },
      radialED: {
        fileName: "RED.png",
        label: "Nested Bubble Chart",
        relativePath: "treeimg/",
      },
      radialLD: {
        fileName: "RLD.png",
        label: "Sunburst Chart",
        relativePath: "treeimg/",
      },
      // Dendro: {
      //   fileName: "dendro.png",
      //   label: "Dendrogram",
      //   relativePath: "treeimg/",
      // },
    },
    task: {
      categorical_value: {
        fileName: "categorical_value.png",
        label: "Node Label",
        relativePath: "taskimg/",
        definition: "The textual label of a node in the tree.",
      },
      quantitative_value: {
        fileName: "quantitative_value.png",
        label: "Node Value",
        relativePath: "taskimg/",
        definition: "The quantitative value of a node.",
      },
      size: {
        fileName: "size.png",
        label: "Tree Size",
        relativePath: "taskimg/",
        definition:
          "The size of a tree is the count of all the nodes in a tree.",
      },
      degree: {
        fileName: "degree.png",
        label: "Node Degree",
        relativePath: "taskimg/",
        definition: "The degree of node is the count of immediate child nodes.",
      },
      ancestors: {
        fileName: "ancestors.png",
        label: "Node Ancestors",
        relativePath: "taskimg/",
        definition: "All possible parent/ancestor nodes of a given node.",
      },
      descendants: {
        fileName: "descendants.png",
        label: "Node Descendants",
        relativePath: "taskimg/",
        definition: "All possible parent/ancestor nodes of a given node.",
      },
      height: {
        fileName: "height.png",
        label: "Tree Height",
        relativePath: "taskimg/",
        definition:
          "The height of a tree is the length of the longest path from the root.",
      },
      balance: {
        fileName: "balanced.png",
        label: "Tree Balance",
        relativePath: "taskimg/",
        definition:
          "A tree is height-balanced if the depth of any two leaf nodes differs by at most 1.",
      },
      path: {
        fileName: "length.png",
        label: "Path",
        relativePath: "taskimg/",
        definition:
          "Find all the nodes from the root of the tree to a given node.",
      },
      depth: {
        fileName: "depth.png",
        label: "Depth",
        relativePath: "taskimg/",
        definition:
          "The depth of a node is the distance of the node from the root of the tree.",
      },
      sibling: {
        fileName: "sibling.png",
        label: "Siblings",
        relativePath: "taskimg/",
        definition: "Nodes that have the same parent are known as siblings.",
      },
      order: {
        fileName: "ordertree.png",
        label: "Order",
        relativePath: "taskimg/",
        definition:
          "An ordered tree is a rooted tree in which each node's children are assigned a fixed ordering.",
      },
    },
    query: {
      identify: {
        fileName: "identify.png",
        label: "Identify",
        relativePath: "queryimg/",
        definition: "Identify a single node or edge in the visualization.",
      },
      compare: {
        fileName: "compare.png",
        label: "Compare",
        relativePath: "queryimg/",
        definition: "Compare two nodes in the visualization.",
      },
      summary: {
        fileName: "summarize.png",
        label: "Summarize",
        relativePath: "queryimg/",
        definition: "Overview of all the nodes in the visualization.",
      },
    },
  },

  taskPropertyMap: {
    categorical_value: {
      identify: { widgets: ["search"], interaction: ["highlight"] },
      summary: { widgets: [], interaction: [] },
    },
    quantitative_value: {
      identify: { widgets: [], interaction: [] },
      summary: { widgets: [], interaction: [] },
    },
    ancestors: {
      identify: { widgets: [], interaction: ["highlight ancestors"] },
      summary: { widgets: [], interaction: ["highlight ancestors"] },
    },
    degree: {
      identify: { widgets: [], interaction: [] },
      summary: { widgets: ["range"], interaction: [] },
    },
  },

  highlightSelectInteraction: [
    { label: "Node", interactionLabel:"Highlight Node", id: "node", active: true, color: "#FAEACB" },
    { label: "Ancestors", interactionLabel:"Show All Ancestors" ,id: "ancestors", active: false, color: "#F7DBD7" },
    { label: "Descendants", interactionLabel:"Show All Descendants" ,id: "descendants", active: false, color: "#9CC0E7" },
    { label: "Direct Children", interactionLabel:"Highlight Children", id: "degree", active: false, color: "#D0B2F1" },
    { label: "Siblings", id: "siblings",interactionLabel:"Highlight Siblings" ,active: false, color: "#ABD2AC" },
    { label: "Path", id: "path", interactionLabel:"Show Path Between Nodes",active: false, color: "#9DA2E9" },
  ],
  tooltipFields: [
    { label: "Node Value", id: "value", active: false },
    { label: "Node Height", id: "height", active: false },
    { label: "Node Depth", id: "value", active: false },
    { label: "Node Degree", id: "value", active: false },
    { label: "SubTree Size", id: "size", active: false },
  ],
  visSettings: [
    {label:"Font Size", id:"fontsize", value:10},
    {label:"Width", id:"width", value:1000},
    {label:"Height", id:"height", value:1000},
    {label:"Node Color", id:"nodecolor", value:"#999"}
  ]
};

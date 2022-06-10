(function () {
  //This is just the class, the variables will be populated based on a function
  recommendation = {};
  class Recommendation {
    visOrder;
    widgets;
    interaction;

    constructor(
      visOrder,
      widgets,
      interaction,
      tooltip,
      visSetting,
      hierarchydata
    ) {
      this.visOrder = visOrder;
      this.widgets = widgets;
      this.interaction = interaction;
      this.tooltip = tooltip;
      this.visSetting = visSetting;
      this.hierarchydata = hierarchydata
    }
  }

  recommendation.createHierarchyData = function (data, value = null) {
    var attr = window.GLOBALDATA.data["nodeSizeMappingAttribute"];
    let defaultAttr = true;
    //Check if selected attr is different than "Degree"
    if (attr !== "Degree") {
      defaultAttr = false;
    }

    const root = d3.hierarchy(data).eachBefore((d, i) => (d.index = i++));

    if (!defaultAttr) {
      value = (d) => d[attr];
      root.sum((d) => Math.max(0, value(d)));
    } else {
      root.count();
    }
    return root;
  };

  recommendation.createRecommendation = function () {
    let tempRec1 = {
      nodelink: {
        fileName: "NL.png",
        label: "Node-Link Plot",
        relativePath: "treeimg/",
        score: 0.8,
      },
      icicle: {
        fileName: "LD.png",
        label: "Icile Plot",
        relativePath: "treeimg/",
        score: 0.7,
      },
      treemap: {
        fileName: "ED.png",
        label: "Treemap",
        relativePath: "treeimg/",
        score: 0.6,
      },
      indented: {
        fileName: "IL.png",
        label: "Indented List",
        relativePath: "treeimg/",
        score: 0.5,
      },
      radialNL: {
        fileName: "RNL.png",
        label: "Radial Node-Link",
        relativePath: "treeimg/",
        score: 0.4,
      },
      radialED: {
        fileName: "RED.png",
        label: "Nested Bubble Chart",
        relativePath: "treeimg/",
        score: 0.4,
      },
      radialLD: {
        fileName: "RLD.png",
        label: "Sunburst Chart",
        relativePath: "treeimg/",
        score: 0.4,
      },
      // Dendro: {
      //   fileName: "dendro.png",
      //   label: "Dendrogram",
      //   relativePath: "treeimg/",
      //   score:0.4
      // }
    };
    let visOrder = tempRec1;
    window.GLOBALDATA.currentVis = "nodelink"; // Should be the top item of of visorder

    /*Determine the right highlight interaction
     */
    let localInteractionCopy = JSON.parse(
      JSON.stringify(window.GLOBALDATA.highlightSelectInteraction)
    );
    let localTaskCopy = window.GLOBALDATA.tasks;
    let model = window.GLOBALDATA.model.interaction;
    // console.log(localTaskCopy, localInteractionCopy, model);
    localTaskCopy.selectedTasks.forEach((element) => {
      let recommendedInteraction = model[element][
        localTaskCopy.selectedQuery
      ].map((d) => d.id);
      localInteractionCopy.forEach((interaction) => {
        if (recommendedInteraction.indexOf(interaction["id"]) !== -1) {
          interaction.active = true;
        }
      });
    });

    /**
     * Convert data to hierarchy
     */
    let hierarchyData = recommendation.createHierarchyData(window.GLOBALDATA.data["data"]);

    let recommendationFinal = new Recommendation(
      visOrder,
      [
        { name: "search", task: "categorical_value", label: "Node Label" },
        {
          name: "range",
          task: "quantitative_value",
          label: "Node Value",
          attrToUse: "value",
        },
      ],
      localInteractionCopy,
      window.GLOBALDATA.tooltipFields,
      window.GLOBALDATA.visSettings,
      hierarchyData
    );
    renderingControl.visUpdate(recommendationFinal);
  };
})();

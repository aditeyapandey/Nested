(function () {
  dataProcessing = {};

  class DataSummary {
    size;
    leaves;
    maxDegree;
    minDegree;
    height;
    hierarchy;

    constructor(size, leaves, maxDegree, minDegree, height, hierarchy) {
      this.size = size;
      this.leaves = leaves;
      this.maxDegree = maxDegree;
      this.minDegree = minDegree;
      this.height = height;
      this.hierarchy = hierarchy;
    }
  }

  class Data {
    fileLabel;
    nodeSizeMappingAttribute;
    data;

    constructor(label, nodeAttribute, data) {
      this.fileLabel = label;
      this.nodeSizeMappingAttribute = nodeAttribute;
      this.data = data;
    }
  }

  class Tasks {
      selectedTasks;
      selectedQuery;

      constructor(selectedTasks,query)
      {
          this.selectedTasks = selectedTasks;
          this.selectedQuery = query;
      }
  }

  //read a file and render vis
  dataProcessing.readFileSetupView = function (fileKey) {
    let fileName = window.GLOBALDATA.files[fileKey]["fileName"];
    let isHierarchy = window.GLOBALDATA.files[fileKey]["isHierarchy"];
    //If input data is already in hierarchy then parse as is

    d3.json("../assets/data/" + fileName).then((data) => {
      d3.json("../assets/model/interaction.json").then((interaction)=>{
        /*
        Read the interaction file 
        */
        window.GLOBALDATA.model = {};
        window.GLOBALDATA.model = interaction;

        /*
        Read and process the hierarchical data file 
        */
        if (isHierarchy) {
          dataProcessing.renderVis(data, fileKey);
          // window.GLOBALDATA.files[fileKey]["data"] = data;
          // createDataObject(data);
          // renderingControl.visUpdate();
        } else {
          let hierarchyOrder = window.GLOBALDATA.files[fileKey]["hierarchy"];
          let values = window.GLOBALDATA.files[fileKey]["values"].map(d =>d.attrName);
          var obj = {
            name: "Superstore",
            children: mapToObject(
              d3.rollup(
                data,
                (v) => {
                  return {
                    value: {
                      ...values.map((val) => {
                        let tempObj = {};
                        tempObj[val] = d3.sum(v, (d) => d[val]);
                        return tempObj;
                      }),
                    },
                  };
                },
                ...hierarchyOrder.map((a) => (d) => d[a])
              )
            ),
          };
          dataProcessing.renderVis(obj, fileKey);
        }
      })

    });
  };

  dataProcessing.renderVis = function (data, fileKey) {
    window.GLOBALDATA.currentFile = fileKey;
    // window.GLOBALDATA.files[fileKey]["data"] = data;
    //instantiating the dataObj
    var dataObj = new Data(fileKey, "Degree", data);
    window.GLOBALDATA.data = dataObj;
    var tasks = new Tasks(["categorical_value"], "identify");
    window.GLOBALDATA.tasks = tasks;
    createDataObject(data);
    recommendation.createRecommendation();
    // renderingControl.visUpdate();
  };

  const mapToObject = (map = new Map()) =>
    Array.from(map.entries(), ([k, v]) => {
      if (v instanceof Map) {
        return {
          name: k,
          children: v instanceof Map ? mapToObject(v) : v,
        };
      } else {
          let finalObj = {}
          finalObj["name"] = k;
          //Unwrapping the variables
          let tempObj = Object.keys(v["value"])
            .map((val) => (v[val] = v["value"][val]))
            .reduce((current, next) => {
              return { ...current, ...next };
            }, {})
            Object.keys(tempObj).map(d=>{
                finalObj[d] = {};
                finalObj[d] = tempObj[d]
            })
            return finalObj;
      }
    });

  createDataObject = function (data) {
    var root = d3.hierarchy(data);
    let height = root.height;
    let size = root.descendants().length;
    let leafNodes = root.leaves().length;

    let maxDegree = -1;
    let maxDegreeNodeLabel = "";
    root.each((d, i) => {
      if (d.children !== undefined) {
        if (d.children.length > maxDegree) {
          maxDegree = d.children.length;
          maxDegreeNodeLabel = d.data.name;
        }
      }
    });

    let minDegree = 1000;
    let minDegreeNodeLabel = "";
    root.each((d, i) => {
      if (d.children !== undefined) {
        if (d.children.length < minDegree) {
          minDegree = d.children.length;
          minDegreeNodeLabel = d.data.name;
        }
      }
    });

    var dataObj = new DataSummary(
      size,
      leafNodes,
      { maxDegree, maxDegreeNodeLabel },
      { minDegree, minDegreeNodeLabel },
      height,
      root
    );
    window.GLOBALDATA.dataSummary = dataObj;
  };
})();

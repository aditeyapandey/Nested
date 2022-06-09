(function () {
  recPanelUI = {};

  recPanelUI.header = function () {
    var recPanel = $(`<div id="recPanelBody"> </div>`);
    $("#recommendationPanel")
      .width(window.GLOBALDATA.panelWidth.recommendationPanel + "%")
      .append(recPanel);
    $("#recPanelBody").append(
      ` <div class="panelHeader p-1 bg-light text-dark">
        <div class="headerText"> Recommendation </div>
        </div>`
    );
  };

  recPanelUI.clearVisOutput = function (divId) {
    $("#" + divId).remove();
  };

  //This is temporary recommendation output panel
  //This panel should be mapped to the recommendation object
  //To make a scrollable div https://jsfiddle.net/ydchauh/1ck7fhuq/2/
  recPanelUI.recommendationInformation = function (recommendation) {
    recPanelUI.clearVisOutput("recInformationPanel");
    // Views
    //let treeImageMap = window.GLOBALDATA.imgMap.tree;
    let treeImageMap = recommendation.visOrder;
    console.log(window.GLOBALDATA.currentVis);
    let recommendationInformationPanel = $(
      `<div class="panelbodyitem" id="recInformationPanel">
        <div class="recInformationTitleText headerContainer"> 
          <span class="headerText headerContainerItem"> Encoding </span>
          <span id="recommendedEncodingLabel" class="headerContainerItem hide"> Selected Encoding: ${treeImageMap[window.GLOBALDATA.currentVis]["label"]}  </span>
          <div class="floatRight">
          <span id="closebtn" class="iconButton"> <i id="closeBtnIcon" class="btn fas fa-minus" title="open-close the encoding tab"></i></span> 
          </div>
        </div>
      <div id="recOptions" class="recOptionsClass"> </div>
      </div>`
    );
    $("#recPanelBody").append(recommendationInformationPanel);

    for (imgKey in treeImageMap) {
      let fileLoc =
        "../../assets/" +
        treeImageMap[imgKey]["relativePath"] +
        treeImageMap[imgKey]["fileName"];
      var imgContainer = $(
        `<div class="recInformationItemContainer ${
          imgKey === window.GLOBALDATA.currentVis ? "selectedItem" : ""
        }" id=${imgKey}> 
            <img class="imgView" src=${fileLoc}> </img> 
            <br>
            <p class="recTreeImgLabel"> ${treeImageMap[imgKey]["label"]} </p>
            <p class="recTreeImgLabel"> Score:${
              treeImageMap[imgKey]["score"]
            } </p>
        </div>
        `
      );
      $("#recOptions").append(imgContainer);
    }

    // //Adding a container for visualization
    // $("#recPanelBody").append(`<div class="visOutputElement" id='visOutput'> </div>`);

    //Events
    $(".recInformationItemContainer").click(function () {
      var elemId = $(this).attr("id");
      window.GLOBALDATA.currentVis = elemId;
      recPanelUI.visualizationNavBar(recommendation);
      recPanelUI.visualizationSettingsBar(recommendation);
      recPanelUI.renderWidgets(recommendation);
      recPanelUI.renderRecommendation(recommendation);

      //renderingControl.visUpdate(recommendation);
      $(".recInformationItemContainer.selectedItem").toggleClass(
        "selectedItem"
      );
      $(this).toggleClass("selectedItem");
    });

    //Closing the recommendation panel
    $("#closebtn").on("click", function(){
      $("#recOptions").toggle("slow");
      $("#recommendedEncodingLabel").toggleClass("hide");
      if($("#closeBtnIcon").attr("class") === "btn fas fa-minus")
      {
        $("#closeBtnIcon").removeClass("fa-minus").addClass("fa-plus");
      }
      else{
        $("#closeBtnIcon").removeClass("fa-plus").addClass("fa-minus");
      }
    })
  };

  //Navigation bar for visualization
  recPanelUI.visualizationNavBar = function (recommendation) {
    console.log(recommendation);
    recPanelUI.clearVisOutput("navBarContainer");
    let tasks = window.GLOBALDATA.tasks.selectedTasks;

    let interactionFlareHTML = "";
    if (recommendation.interaction) {
      let interactionTags = recommendation.interaction
      .filter(interaction => interaction.active)
      .map(interaction => {
        return `<span class="tag" style="background-color: ${interaction.color}">${interaction.label}</span>`
      }).join('\n');
      interactionFlareHTML += `<span>
        <span class="tag-label">Interactions</span>
        ${interactionTags}
      </span>`
    }

    let widgetFlareHTML = "";
    if (recommendation.widgets) {
      let widgetTags = recommendation.widgets.map(widget => {
        return `<span class="tag">${widget}</span>`
      }).join('\n');
      widgetFlareHTML += `<span>
      <span class="tag-label">Widgets</span>
        ${widgetTags}
      </span>`
    }

    $("#recPanelBody").append(
      `
      <div id="navBarContainer" class="panelbodyitem">
      <div class="headerContainer"> 
        <div class="headerContainerItem" id="fileName">
        <span class="headerText"> ${
          window.GLOBALDATA.files[window.GLOBALDATA.currentFile]["label"]
        } </span>
        </div>
        <div class="headerContainerItem floatRight" id="visSetting">
          <span class="iconButton" id="settingIcon"> <i class="btn fas fa-cog" title="Configure the visualization"></i> </span>
          <span class="iconButton" id="exportIcon"> <i class="btn fas fa-file-export" title="Export the visualization"></i> </span>
        </div>
        <br/>
      </div>
      <div>
        ${interactionFlareHTML}
        ${widgetFlareHTML}
      </div>
      ${recPanelUI.visualizationSettingsBar(recommendation)}
      </div>
      `
      //<i class="btn fas fa-file-export" title="Export the visualization"></i>
    );

    //Event
    $("#searchBox").on("change", function () {
      dendrogram.searchLabelInteraction($(this).val());
    });
    $("#settingIcon").on("click", function () {
      $(this).toggleClass("underline");
      $(".visSettingsPanel").toggle("slow");
    });

    //Event handler for checkbox
    $(".interactionCheckbox").on("change", function () {
      values = [];
      $("#interactionOption input[type='checkbox']:checked").each(
        (_, { value }) => {
          values.push(value);
        }
      );
      console.log(values);
    });
  };

  //Settings Panel
  recPanelUI.visualizationSettingsBar = function (recommendation) {
    const recommendationOptions = {};

    /* ==================================== */
    /*               Highlight              */
    /* ==================================== */
    let interactionCheckBoxOptions = recommendation.interaction.map((val) => {
      return `<div class="form-check-inline">
              <label class="form-check-label">
                <input type="checkbox" class="form-check-input interactionCheckbox" value=${
                  val.label
                } ${val.active ? "checked" : ""}> ${val.label}
              </label>
              </div>`;
    });
    let highlightCheckBoxHTML = interactionCheckBoxOptions.join("");
    recommendationOptions.interactionOption = {label: "Highlight", html: highlightCheckBoxHTML};

    /* ==================================== */
    /*                Tooltip               */
    /* ==================================== */
    let tooltipCheckBoxOptions = recommendation.tooltip.map((val) => {
      return `<div class="form-check-inline">
              <label class="form-check-label">
                <input type="checkbox" class="form-check-input interactionCheckbox" value=${
                  val.label
                } ${val.active ? "checked" : ""}> ${val.label}
              </label>
              </div>`;
    });
    let tooltipcheckBoxHTML = tooltipCheckBoxOptions.join("");
    recommendationOptions.tooltipOption = {label: "Tooltip", html: tooltipcheckBoxHTML};

    /* ==================================== */
    /*               Font Size              */
    /* ==================================== */
    const FONT_SIZE_CONSTRAINTS = {lower: 8, higher: 16, selected: 10};
    let fontSizeSelectionsHTML = "";
    for (let i = FONT_SIZE_CONSTRAINTS.lower; i <= FONT_SIZE_CONSTRAINTS.higher; i++) {
      if (i == FONT_SIZE_CONSTRAINTS.selected) {
        fontSizeSelectionsHTML += `<option value="${i}" selected>${i}</option>`;
      } else {
        fontSizeSelectionsHTML += `<option value="${i}">${i}</option>`;
      }
    }
    let fontSizeOptionHTML = `
      <div class="form-check-inline">
        <select name="fontSize" id="fontSize" class="form-check-input" >
          ${fontSizeSelectionsHTML}
        </select>
      </div>
    `;
    recommendationOptions.fontSizeOption = {label: "Font Size", html: fontSizeOptionHTML}

    /* ==================================== */
    /*              Node Color              */
    /* ==================================== */
    let nodeColorHTML = `
      <div class="form-check-inline">
        <input type="color" id="nodeColorPicker" value="#dfdfdf" class="form-check-input">
      </div>
    `;
    recommendationOptions.nodeColor = {label: "Node Color", html: nodeColorHTML};

    /* ==================================== */
    /*                 Height               */
    /* ==================================== */
    let heightHTML = `
      <div class="form-check-inline">
        <input type="text" id="heightInput" value="1000" class="form-check-input">
      </div>
    `;
    recommendationOptions.height = {label: "Height", html: heightHTML};


    /* ==================================== */
    /*                 Width                */
    /* ==================================== */
    let widthHTML = `
      <div class="form-check-inline">
        <input type="text" id="widthInput" value="1000" class="form-check-input">
      </div>
    `;
    recommendationOptions.width = {label: "Width", html: widthHTML};

    let visSettingsPanel = "";
    for (const id in recommendationOptions) {
      visSettingsPanel += `
      <tr id="visSettingPanelRow">
        <div id="${id}" class="visSettingElement form-group">
          <td>
            <label class="bold">${recommendationOptions[id].label} </label>
          </td>
          <td style="width: 85%">
            ${recommendationOptions[id].html}
          </td>
        </div>
      </tr>
      `
    }

    return `
    <div id="visSettingDropdownPanel" class="panelbodyitem visSettingsPanel">
      <table style="width:100%">
        ${visSettingsPanel}
     </table>
    </div>`;
  };

  recPanelUI.renderWidgets = function (recommendation) {
    recPanelUI.clearVisOutput("widgetContainer");


    $("#recPanelBody").append(
      ` <div class="widgetContainerBody panelbodyitem" id="widgetContainer">
        </div>`
    );
    for (widget of recommendation.widgets) {
    if (widget === "search") {
      $("#widgetContainer").append(widgetSearchBox.createSearchBox());
    }
    if (widget === "range") {
      $("#widgetContainer").append(widgetRangeFilter.createRangeFilter());
      widgetRangeFilter.setupRangeFilter();
    }
  }
  };

  //Params: recommendation: Object that is returned by recommendation system.
  recPanelUI.renderRecommendation = function () {
    recPanelUI.clearVisOutput("visOutput");
    let recommendation =
      window.GLOBALDATA.currentVis === ""
        ? "nodelink"
        : window.GLOBALDATA.currentVis;
    var data = window.GLOBALDATA.data["data"];
    var attr = window.GLOBALDATA.data["nodeSizeMappingAttribute"];
    let defaultAttr = true;
    //Check if selected attr is different than "Degree"
    if (attr !== "Degree") {
      defaultAttr = false;
    }
    //Checking ancestor interaction
    let tasks = window.GLOBALDATA.tasks.selectedTasks;
    let isHighLightAncestor = false;
    let query = window.GLOBALDATA.tasks.selectedQuery;
    for (val of tasks) {
      if (
        window.GLOBALDATA.taskPropertyMap[val][query]["interaction"].indexOf(
          "highlight ancestors"
        ) !== -1
      ) {
        isHighLightAncestor = true;
      }
    }

    //Adding a container for visualization
    $("#recPanelBody").append(
      `<div class="visOutputElement panelbodyitem" id='visOutput'> </div>`
    );
    let chart;
    if (recommendation === "nodelink") {
      chart = dendrogram.createDendrogram(data, {
        label: (d) => d.name,
        // title: (d, n) =>
        //   `${n
        //     .ancestors()
        //     .reverse()
        //     .map((d) => d.data.name)
        //     .join(".")}`, // hover text
        width: 850,
        value: defaultAttr ? null : (d) => d[attr],
        // highlightAncestors: isHighLightAncestor,
      });
    }
    if (recommendation === "icicle") {
      chart = icicle.createIcicle(data, {
        label: (d) => d.name,
        // title: (d, n) =>
        //   `${n
        //     .ancestors()
        //     .reverse()
        //     .map((d) => d.data.name)
        //     .join(".")}`, // hover text
        value: defaultAttr ? null : (d) => d[attr],
        width: 1152,
        height: 1000,
      });
    }
    if (recommendation === "treemap") {
      chart = nestedTreemap.createChart(data, {
        width: 1152,
        height: 1152,
        value: defaultAttr ? null : (d) => d[attr],
      });
      // chart = treemap.createTreemap(data, {
      //   label: (d) => d.name,
      //   group: (d) => d.name.split(".")[1], // e.g., "animate" in "flare.animate.Easing"; for color
      //   title: (d, n) =>
      //     `${n
      //       .ancestors()
      //       .reverse()
      //       .map((d) => d.data.name)
      //       .join(".")}`, // hover text
      //   value: defaultAttr ? null : (d) => d[attr],
      //   width: 1152,
      //   height: 1152,
      // });
    }
    if (recommendation === "indented") {
      chart = indentedList.createIndentedList(data, {});
    }
    if (recommendation === "radialNL") {
      chart = radialNodeLink.createChart(data, {
        label: (d) => d.name,
        // title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}`, // hover text
        value: defaultAttr ? null : (d) => d[attr],
        width: 1000,
        height: 1152,
      });
    }
    if (recommendation === "radialLD") {
      chart = sunburst.createChart(data, {
        label: (d) => d.name,
        // title: (d, n) =>
        //   `${n
        //     .ancestors()
        //     .reverse()
        //     .map((d) => d.data.name)
        //     .join(".")}`, // hover text
        value: defaultAttr ? null : (d) => d[attr],
        width: 1152,
        height: 1152,
      });
    }
    if (recommendation === "radialED") {
      chart = nestedBubble.createChart(data, {
        value: defaultAttr ? null : (d) => d[attr],
        label: (d, n) => d.name.split(/(?=[A-Z][a-z])/g),
        // title: (d, n) => `${n.ancestors().reverse().map(({data: d}) => d.name).join(".")}\n${n.value.toLocaleString("en")}`,
        width: 1152,
        height: 1152,
      });
    }
    $("#visOutput").append(chart);
  };
})();

(function () {
  widgetRangeFilter = {};
  widgetRangeFilter.createRangeFilter = function (widget) {
    console.log(widget);
    return `
        <div class="col-4 widgetElement" id="rangeFilter">
            <p class="bold"> ${widget.label} </p>
            <div id="vis"></div>
            <div id="slider-range"></div>
        <div>`;
  };
  widgetRangeFilter.setupRangeFilter = function (widget,data) {

    console.log(widget.attrToUse);
    let allData = data.descendants();
    let min = d3.min(allData.map(d => d[widget.attrToUse]));
    let max = d3.max(allData.map(d => d[widget.attrToUse]));

    var yourVlSpec = createVegaSpec(50, 50, [min, max],allData,widget.attrToUse);
    $("#slider-range").slider({
      range: true,
      min: min,
      max: max,
      values: [min, max],
      slide: function (event, ui) {
        // $("#amount").val(ui.values[0] + " - " + ui.values[1]);
        var yourVlSpec = createVegaSpec(50, 50, [ui.values[0], ui.values[1]],allData,widget.attrToUse);
        vegaEmbed("#vis", yourVlSpec, {"actions": false}).then(({ spec, view }) => {
          view.addSignalListener("brush", function (event, item) {
            $("#slider-range").slider("values", [
              Math.floor(item["Acceleration"][0]),
              Math.floor(item["Acceleration"][1]),
            ]);
          });
        });
      },
    });

    vegaEmbed("#vis", yourVlSpec, {"actions": false}).then(({ spec, view }) => {
      view.addSignalListener("brush", function (event, item) {
        $("#slider-range").slider("values", [
          Math.floor(item["Acceleration"][0]),
          Math.floor(item["Acceleration"][1]),
        ]);
      });
    });
  };

  function createVegaSpec(width, height, sliderRange,allData,attrToUse) {
    let vegaSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {values:allData},
      height: height,
      layer: [
        {
          params: [
            {
              name: "brush",
              select: { type: "interval", encodings: ["x"] },
              value: { x: [sliderRange[0], sliderRange[1]] },
            },
          ],
          mark: "bar",
          encoding: {
            x: { field: attrToUse, bin: true },
            y: { aggregate: "count", title:"count" },
          },
        },
        {
          transform: [{ filter: { param: "brush" } }],
          mark: "bar",
          encoding: {
            x: { field: attrToUse, bin: true },
            y: { aggregate: "count", title:"count" },
            color: { value: "goldenrod" },
          },
        },
      ],
      actions:false
    };
    console.log(vegaSpec);
    return vegaSpec;
  }
})();

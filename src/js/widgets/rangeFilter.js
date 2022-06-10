(function () {
  widgetRangeFilter = {};
  widgetRangeFilter.createRangeFilter = function (widget) {
    console.log(widget);
    return `
        <div class="col-4 widgetElement" id="rangeFilter">
            <p class="bold"> Degree </p>
            <div id="vis"></div>
            <div id="slider-range"></div>
        <div>`;
  };
  widgetRangeFilter.setupRangeFilter = function (widget,data) {
    console.log(widget,data);

    var yourVlSpec = createVegaSpec(50, 50, [0, 26]);
    $("#slider-range").slider({
      range: true,
      min: 8,
      max: 26,
      values: [8, 26],
      slide: function (event, ui) {
        // $("#amount").val(ui.values[0] + " - " + ui.values[1]);
        var yourVlSpec = createVegaSpec(50, 50, [ui.values[0], ui.values[1]]);
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

  function createVegaSpec(width, height, sliderRange) {
    let vegaSpec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        url: "https://raw.githubusercontent.com/vega/vega/main/docs/data/cars.json",
      },
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
            x: { field: "Acceleration", bin: true },
            y: { aggregate: "count", title:"count" },
          },
        },
        {
          transform: [{ filter: { param: "brush" } }],
          mark: "bar",
          encoding: {
            x: { field: "Acceleration", bin: true },
            y: { aggregate: "count", title:"count" },
            color: { value: "goldenrod" },
          },
        },
      ],
      actions:false
    };
    return vegaSpec;
  }
})();

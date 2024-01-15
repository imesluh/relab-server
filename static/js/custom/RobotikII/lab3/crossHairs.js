// TODO: Change - Hypothesis: This js is responsible for drawing a crosshair on the video stream
function startCrossHair() {
  var videowidth = $("#stream").width();
  var videoheight = $("#stream").height();
  var moveable = true;
  var svgContainer = d3.select("#stream").append("svg")
    .attr("width", videowidth)
    .attr("height", videoheight)
    .attr("id", "svgContainer1")
    .attr("style", "position: absolute; top: 0px; left:15px;")
    .attr("transform", "translate(0,0)");
  var yCoordCross1 = videoheight / 2 - 60 - 5 * (videoheight / 600);
  var xCoordCross1 = videowidth / 2 - 45 - 2 * (videowidth / 800);

  $("#cross1").css({ top: yCoordCross1, left: xCoordCross1, position: 'absolute' });
  if (allowed) { $("#cross1").css('display', 'block'); } else { $("#cross1").css('display', 'none'); }

  var svg = svgContainer.append("g");
  var crossHair = svg.append("g").attr("class", "crosshair")
    .attr("id", "crosshair1");

  var jsonLines = [{ "x1": 0, "y1": 0, "x2": 0, "y2": 0, "id": "crosshair_h1", "stroke": "red", "strokewidth": "3px", "display": "none" },
  { "x1": 0, "y1": 0, "x2": 0, "y2": 0, "id": "crosshair_h2", "stroke": "red", "strokewidth": "3px", "display": "none" },
  { "x1": 0, "y1": 0, "x2": 0, "y2": 0, "id": "crosshair_v1", "stroke": "red", "strokewidth": "3px", "display": "none" },
  { "x1": 0, "y1": 0, "x2": 0, "y2": 0, "id": "crosshair_v2", "stroke": "red", "strokewidth": "3px", "display": "none" }];

  var jsonCircles = [{ "cx": 0, "cy": 0, "r": 0, "id": "circle1", "stroke": "red", "strokewidth": "3px", "display": "none", "fill": "none" }];

  var lines = crossHair.selectAll("line")
    .data(jsonLines)
    .enter()
    .append("line");

  var circles = crossHair.selectAll("circle")
    .data(jsonCircles)
    .enter()
    .append("circle");

  var linesAttributes = lines
    .attr("id", function (d) { return d.id; })
    .attr("x1", function (d) { return d.x1; })
    .attr("y1", function (d) { return d.y1; })
    .attr("x2", function (d) { return d.x2; })
    .attr("y2", function (d) { return d.y2; })
    .style("stroke", function (d) { return d.stroke; })
    .style("stroke-width", function (d) { return d.strokewidth; })
    .style("display", function (d) { return d.display; });


  var circlesAttributes = circles
    .attr("id", function (d) { return d.id; })
    .attr("cx", function (d) { return d.cx; })
    .attr("cy", function (d) { return d.cy; })
    .attr("r", function (d) { return d.r; })
    .style("stroke", function (d) { return d.stroke; })
    .style("stroke-width", function (d) { return d.strokewidth; })
    .style("display", function (d) { return d.display; })
    .style("fill", "none");

  $("#crosshair1").css('display', 'none');

  //#region mouse activity
  svg.on("click", function () {
    d3.selectAll(".crosshair").style("display", "block");
    ux = (d3.mouse(this)[0]) / videowidth;
    uy = (d3.mouse(this)[1]) / videoheight;
    if (allowed) {
      var send_data = new Array(2);
      send_data[0] = ux;
      send_data[1] = uy;
      $.ajax({
        url: '/RobotikII/rest/be/CI/lab3/start2/',
        data: JSON.stringify(send_data),
        type: 'POST',
        contentType: "application/json",
        dataType: 'json'
      }).done(function (data) {
        if (data.success) {
        } else {
          BootstrapDialog.alert(data['resp']);
        }
        ;
      }).fail(function (data) {
        BootstrapDialog.alert(unescape('Das Starten des Experiments ist fehlgeschlagen.'));
      });
    }
  })
    .on("mousemove", function () {
      if (allowed) {
        var xCoord = d3.mouse(this)[0],
          yCoord = d3.mouse(this)[1];
        addCrossHair(xCoord, yCoord);
      }
    })
    .on("mouseover", function () {
      if (allowed) {
        d3.selectAll(".crosshair").style("display", "block");
      }
    })
    .on("mouseout", function () {
      if (moveable == true) {
        d3.selectAll(".crosshair").style("display", "none");
      } else {
        d3.selectAll(".crosshair").style("display", "block");
      }
    })
    .append("rect")
    .style('visibility', 'hidden')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', videowidth)
    .attr('height', videoheight);
 //#endregion

  function addCrossHair(xCoord, yCoord) {
    d3.select("#crosshair_h1")
      .attr("x1", xCoord + 10)
      .attr("y1", yCoord)
      .attr("x2", xCoord + 50)
      .attr("y2", yCoord)
      .style("display", "block");

    d3.select("#crosshair_h2")
      .attr("x1", xCoord - 50)
      .attr("y1", yCoord)
      .attr("x2", xCoord - 10)
      .attr("y2", yCoord)
      .style("display", "block");

    d3.select("#crosshair_v1")
      .attr("x1", xCoord)
      .attr("y1", yCoord - 50)
      .attr("x2", xCoord)
      .attr("y2", yCoord - 10)
      .style("display", "block");

    d3.select("#crosshair_v2")
      .attr("x1", xCoord)
      .attr("y1", yCoord + 10)
      .attr("x2", xCoord)
      .attr("y2", yCoord + 50)
      .style("display", "block");

    d3.select("#circle1")
      .attr("cx", xCoord)
      .attr("cy", yCoord)
      .attr("r", 30)
      .style("display", "block");
    }

}

var height = 1000,
 	width = 1000,
 	time_width = 500,
 	margins = {top: 25, left: 10, right: 10, bottom: 10},
 	scale = d3.time.scale().range([0, time_width]),
  verticalScale = d3.time.scale().range([0, time_width]),
 	time = d3.time.format("%M:%S"),
  axis = d3.svg.axis().scale(scale).orient("top").tickFormat(time);

svg = d3.select("body").append("svg")
 .attr("width", width)
 .attr('height', height)
 .append("g")
 .attr("transform","translate(" + margins.left + "," + margins.top + ")");

d3.csv("mens_knight_invite14.csv", function(error, data) {
  //scale.domain([time.parse(data[0].time), time.parse(data[data.length - 1].time)]);

  data = _.reject(data, function(d){ return d.adjplace == "DNS" || d.adjplace == "(< 5)" || d.adjplace == "(> 7)"; });

  scale.domain([time.parse("00:00"), time.parse(data[data.length - 1].time)]);

  var teamData = _.groupBy(data, "team");

  // for first five (scoring) teammates add up score so we can make stacked chart
  _.map(teamData, function(d){
    totalPlace = 0;
    for (var i = 0; i < 5; i++) {
      d[i].total = +totalPlace;
      totalPlace += +d[i].adjplace;
      d.team = d[i].team; // yeah this happens every time oh well...
    }
    return d;
  });

  console.log(teamData);
  maxScore = 0;
  _.map(teamData, function(d){
      d.total = _.chain(d)
        .first(5)
        .map(function(d){ return +d.adjplace; })
        .reduce(function(m, n){ return m + n; })
        .value();
      if (d.total > maxScore)
        maxScore = d.total;
      return d;
    });

  teamData = _.sortBy(teamData, "total");

  verticalScale.domain([0, maxScore]);

  svg.append("g")
    .attr("class", "axis")
    .call(axis);

  var runners = svg.selectAll(".runners")
    .data(data)
    .enter()
    .append("g")
    .attr("class", function(d){
      if (d.team != "Unattached")
        return "runners " + d.team + " place-" + d.place;
      return "runners" + " place-" + d.place;
    })
    .attr("transform", function(d, i){ return "translate(0," + (i * 3) + ")"; });

  runners.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", function(d){ return scale(time.parse(d.time)); })
    .attr("height", 2);

  runners.append("text")
    .attr("x", function(d){ return scale(time.parse(d.time));})
    .attr("y", 0)
    .text(function(d){ return d.name; });

  runners.on('mouseover', function(d){
    d3.selectAll("." + d.team).classed("highlighted", true);
    d3.selectAll(".place-" + d.place).classed("selected", true);
  }).on('mouseout', function(d){
  	d3.selectAll("." + d.team).classed("highlighted", false);
    d3.selectAll(".place-" + d.place).classed("selected", false);
  });

  var teams = svg.selectAll("g.teams")
    .data(_.values(teamData))
    .enter()
    .append("g")
    .attr("class", "teams")
    .attr("transform", function(d, i){ return "translate(" + (time_width + i * 15) + ",50)"; });

  teams.append("text")
    .text(function(d){return d.team})
    .attr("transform", "translate(0,0)rotate(-45)");


  var teammates = teams.selectAll(".teammates")
    .data(function(d) { console.log(d); return _.first(d, 5); })
    .enter()
    .append("g")
    .attr("class", function(d){return "teammates place-" + d.place + " " + d.team;});

  teammates.append("rect")
    .attr("x", 0)
    .attr("y", function(d){ return verticalScale(d.total); })
    .attr("height", function(d){ return verticalScale(+d.adjplace); })
    .attr("width", 10);

  teammates.on('mouseover', function(d){
    d3.selectAll("." + d.team).classed("highlighted", true);
    d3.selectAll(".place-" + d.place).classed("selected", true);
  }).on('mouseout', function(d){
    d3.selectAll("." + d.team).classed("highlighted", false);
    d3.selectAll(".place-" + d.place).classed("selected", false);
  });

});

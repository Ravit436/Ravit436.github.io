
var margin = {top: 50, right: 50, bottom: 150, left: 50},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var	parseDate = d3.time.format("%d-%m-%Y");

var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .05);

var y = d3.scale.linear()
          .range([height, 0])
          .domain([0,100]);

var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .tickFormat(d3.time.format("%d-%m-%Y"));

var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(10);

var check = 0;
var returnVal;
var storeData;

function showBy()
{
  returnVal=["Not Found"];
  storeData=[];
  var xShows = null, regionname = null;
  var showing = document.getElementById("showing");
  var region = document.getElementById("region").value;
  regionname = document.getElementById("regionname").value;
  var startdate = parseDate.parse(document.getElementById("startdate").value);
  var enddate = parseDate.parse(document.getElementById("enddate").value);

  console.log("start : "+startdate+" end : "+enddate);
  if(region == "select")
  {
    showing.innerHTML = "Please Select the type of region";
    return 0;
  }

  if(enddate - startdate < 0)
  {
    showing.innerHTML = "End Date should be greater than Start Date";
    return 0;
  }

  var timeSpan = 0;
  if(startdate.getYear() == enddate.getYear())
    timeSpan = enddate.getDate()+1-startdate.getDate()+30*(enddate.getMonth()-startdate.getMonth());
  else
    timeSpan = enddate.getDate()+1-startdate.getDate()+30*(enddate.getMonth()+12-startdate.getMonth())+360*(enddate.getYear()-startdate.getYear()-1);
  console.log(timeSpan);

  var displayTime = chooseTime(timeSpan);
  console.log(displayTime);

  d3.json("data.json", function(data)
  {
    var searchValue = searchRegion(region,regionname,data);

    console.log(searchValue);

    if(searchValue.length == 2)
      operation(displayTime,searchValue[1].place,startdate,enddate);
    else
    {
      showing.innerHTML = region + " " + regionname + " " +searchValue[0];
      return 0;
    }
    console.log(storeData);
    var graphData = _(storeData)
      .groupBy("date")
      .map(function (data) {

          var summation = _.sumBy(data, "literacy_rate")
          return {
              date: data[0].date,
              literacy_rate: summation/data.length
          };
      }).value();

    console.log(graphData);

    x.domain(graphData.map(function(d) { return d.date; }));

    if(check++ == 0)
    {
      svg.append("g")
         .attr("class", "x axis")
         .attr("transform","translate(0,"+height+")")
         .transition().duration(2000).ease("sin-in-out")
         .call(xAxis)
         .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.5em")
          .attr("transform", "rotate(-90)" );
        }
        else {
          svg.select("g.x.axis")
          .selectAll("text")
          .transition().duration(2000).attr("y",2000);

          svg.select("g.x.axis")
          .transition().duration(2000).ease("sin-in-out")
          .call(xAxis)
          .selectAll("text")
           .style("text-anchor", "end")
           .attr("dx", "-.8em")
           .attr("dy", "-.5em")
           .attr("transform", "rotate(-90)" );
        }


    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".7em")
       .style("text-anchor", "end")
       .text("Literacy rate");

    var updateSvg = svg.selectAll("rect").data(graphData);

    updateSvg.enter().append("rect");

    updateSvg.style("fill", "steelblue")
             .transition().duration(2000)
             .attr("width", x.rangeBand())
             .attr("x", function(d) { return x(d.date); })
             .attr("y", function(d) { return y(d.literacy_rate); })
             .attr("height", function(d) { return height - y(d.literacy_rate); });

    updateSvg.exit().remove();

    showing.innerHTML = searchValue[0];

  });
}

  function chooseTime(timeSpan)
  {
    if(timeSpan > 0 && timeSpan <= 900)
      return 'month';
    else if(timeSpan > 900 && timeSpan <= 10600)
      return 'year';
    else if(timeSpan > 10600 && timeSpan <= 106000)
      return 'decade';
    else
      return 'century';
  }

  function operation (value,data,startdate,enddate)
  {

    function opCentury ()
    {
      var year = Math.floor(startdate.getYear()/100);
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      var sum = 0, count = 0;
      for(var i=0;i < value.data.length;i++)
      {
        var date = parseDate.parse(value.data[i].date);

        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {

          console.log(Math.floor(date.getYear()/100)+"   "+year);
          if(Math.floor(date.getYear()/100) == year)
          {
            sum+=value.data[i].val;
            count++;
          }
          else
          {
            console.log("Sum "+sum+" c" +count);
            storeData.push({
              "date": parseDate.parse(value.data[i-count].date),
              "literacy_rate": sum/count
            });
            year++;
            sum=value.data[i].val;
            count=1;
          }
        }
      }

        storeData.push({
          "date": parseDate.parse(value.data[i-count].date),
          "literacy_rate": sum/count
        });
      return storeData;

    }

    function opDecade ()
    {
      var year = Math.floor(startdate.getYear()/10);
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      var sum = 0, count = 0;
      for(var i=0;i < value.data.length;i++)
      {
        var date = parseDate.parse(value.data[i].date);

        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {

          console.log(Math.floor(date.getYear()/10)+"   "+year);
          if(Math.floor(date.getYear()/10) == year)
          {
            sum+=value.data[i].val;
            count++;
          }
          else
          {
            console.log("Sum "+sum+" c" +count);
            storeData.push({
              "date": parseDate.parse(value.data[i-count].date),
              "literacy_rate": sum/count
            });
            year++;
            sum=value.data[i].val;
            count=1;
          }
        }
      }

        storeData.push({
          "date": parseDate.parse(value.data[i-count].date),
          "literacy_rate": sum/count
        });
      return storeData;
    }

    function opYear ()
    {
      var year = startdate.getYear();
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      var sum = 0, count = 0;
      for(var i=0;i < value.data.length;i++)
      {
        var date = parseDate.parse(value.data[i].date);

        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {
          console.log("Sum "+sum+" c" +count);
          if(date.getYear() == year)
          {
            sum+=value.data[i].val;
            count++;
          }
          else
          {

              console.log("Sum "+sum+" c" +count);
            storeData.push({
              "date": parseDate.parse(value.data[i-count].date),
              "literacy_rate": sum/count
            });
            year++;
            sum=value.data[i].val;
            count=1;
          }
        }
      }
      storeData.push({
        "date": parseDate.parse(value.data[i-count].date),
        "literacy_rate": sum/count
      });
      return storeData;

    }

    function opMonth (data)
    {
      _.forEach(data, function(value)
      {
        var filtered = _.filter(value.database, function(value)
        {
          var month = parseInt(value.date.substr(3,4));
          var year = parseInt(value.date.substr(6,9));
          if((year == startdate.getYear()+1900) && year == (enddate.getYear()+1900))
          {
            if(month >= (startdate.getMonth()+1) && month <= (enddate.getMonth()+1))
              return true;
            else
              return false;
          }
          else {
            if(month >= (startdate.getMonth()+1) && year == (startdate.getYear()+1900))
              return true;
            else if(month <= (enddate.getMonth()+1) && year == (enddate.getYear()+1900))
              return true;
            else if(year > (startdate.getYear()+1900) && year < (enddate.getYear()+1900))
              return true;
            else
              return false;
          }

          //return (month >= (startdate.getMonth()+1) && year >= (startdate.getYear()+1900) && month <= (enddate.getMonth()+1) && year <= (enddate.getYear()+1900) );
        });
        _.forEach(filtered, function(value)
        {
          storeData.push({
            "date": parseDate.parse(value.date),
            "literacy_rate": value.val
          });
        });
        opMonth(value.place);
      });
    }

    var timeIn =
    {
      'century': opCentury,
      'decade': opDecade,
      'year': opYear,
      'month': opMonth,
    };
    timeIn[value](data);
  }



  function searchRegion (name,valuePlace,data)
  {
    _.forEach(data, function(value)
    {
      if(value.name == valuePlace && value.region == name)
      {
        console.log(value);
        returnVal = [name+" " + valuePlace + " is found",value];
        return false;
      }
      else
        searchRegion(name,valuePlace,value.place);
    });
    return returnVal;
  }

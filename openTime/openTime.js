// const parseTime = d3.timeParse("%H%M");
// const formatTime = d3.timeFormat("%H:%M");
// const days = ["一", "二", "三", "四", "五", "六", "日"];

// const colors = ["#FF70AE", "#85B4FF", "#FFCE47"]; // 定義顏色陣列

// function updateChart(restaurant_time) {
//   const svgContainer = d3.select(".openTime");
//   svgContainer.selectAll("*").remove();

//   const svg = svgContainer
//     .append("svg")
//     .attr("width", 300)
//     .attr("height", 250)
//     .append("g")
//     .attr("class", "openTime")
//     .attr("transform", "translate(40,60)");

//   const xScale = d3.scaleBand().domain(days).range([0, 200]).padding(0.1);
//   const yScale = d3
//     .scaleTime()
//     .domain([parseTime("0000"), parseTime("2400")])
//     .range([0, 180]);

//   restaurant_time.forEach((restaurant, index) => {
//     const extendedData = [];

//     const allHoursPeriods = JSON.parse(restaurant.r_hours_periods);

//     allHoursPeriods.forEach((period) => {
//       let start = parseTime(period.startTime);
//       let end = parseTime(period.endTime);
//       if (end < start) {
//         extendedData.push({
//           status: period.status,
//           day: period.day,
//           start: start,
//           end: parseTime("2400"),
//           nextDay: true,
//         });
//         extendedData.push({
//           status: period.status,
//           day: (period.day % 7) + 1,
//           start: parseTime("0000"),
//           end: end,
//           nextDay: true,
//         });
//       } else {
//         extendedData.push({
//           status: period.status,
//           day: period.day,
//           start: start,
//           end: end,
//           nextDay: false,
//         });
//       }
//     });
    
//     const barWidth = xScale.bandwidth() / 3; // 每個 bar 寬度為原來的三分之一

//     svg
//       .selectAll(".open-bar" + index)
//       .data(extendedData)
//       .enter()
//       .append("rect")
//       .attr("class", "open-bar open-bar-" + index)
//       .attr("x", (d) => xScale(days[d.day - 1]) + barWidth * index)
//       .attr("y", yScale(parseTime("2400"))) // 初始設置於底部
//       .attr("width", barWidth)
//       .attr("height", 0) // 初始高度為0
//       .attr("fill", colors[index]) // 使用指定的顏色
//       .attr("opacity", 0.7)
//       .transition() // 加入動畫效果
//       .duration(750)
//       .attr("y", (d) => yScale(d.start))
//       .attr("height", (d) => yScale(d.end) - yScale(d.start));
//   });

//   // 添加垂直分隔线
//   days.forEach((day, i) => {
//     if (i < days.length - 1) { // 不在最后一天添加线
//       svg.append("line")
//         .attr("x1", xScale(day) + xScale.bandwidth()) // 每天的右侧
//         .attr("x2", xScale(day) + xScale.bandwidth()) // 相同的 x 位置
//         .attr("y1", 0)
//         .attr("y2", yScale(parseTime("2400")))  //虛線到哪裡
//         .attr("stroke", "#ccc")
//         .attr("stroke-width", 1)
//         .attr("stroke-dasharray", "4 2"); // 虚线
//     }
//   });

//   const yAxis = d3.axisLeft(yScale).tickFormat(formatTime);
//   svg.append("g").attr("class", "axis").call(yAxis);

//   const xAxis = d3.axisTop(xScale);
//   svg
//     .append("g")
//     .attr("class", "axis")
//     .attr("transform", "translate(0,0)")
//     .call(xAxis);
// }

// export function highlightRestaurant(index) {
//   d3.selectAll(".open-bar").classed("dim", true);
//   d3.selectAll(".open-bar-" + index)
//     .classed("highlight", true)
//     .classed("dim", false);

//   d3.select(`#button-${restaurantIds[index]}`)
//     .style("background-color", colors[index])
//     .style("color", "#fff");
// }

// export function resetHighlight() {
//   d3.selectAll(".open-bar").classed("dim", false).classed("highlight", false);

//   d3.selectAll(".button-container button")
//     .style("background-color", "#f0f0f0")
//     .style("color", "#000");
// }

// export function showRestaurantData(restaurantId) {
//   const hoursPeriods = data[restaurantId];
//   updateChart([hoursPeriods]);

//   document.querySelectorAll(".button-container button").forEach((button) => {
//     button.classList.remove("selected");
//   });
//   document.getElementById(`button-${restaurantId}`).classList.add("selected");
// }

// document.addEventListener("DOMContentLoaded", () => {
//   updateChart(Object.values(restaurant_time)); // 顯示所有餐廳的詳細營業時間
// });

const parseTime = d3.timeParse("%H%M");
const formatTime = d3.timeFormat("%H:%M");
const days = ["一", "二", "三", "四", "五", "六", "日"];

const colors = ["#FF70AE", "#85B4FF", "#FFCE47"]; // 定义颜色数组

// 新的时间转换函数
function convertTimeToNormalized(time) {
  const hour = time.getHours();
  const minute = time.getMinutes();
  // 如果时间在 06:00 到 23:59 之间
  if (hour >= 6) {
    return hour - 6 + minute / 60;
  }
  // 如果时间在 00:00 到 05:59 之间
  return hour + 18 + minute / 60;
}

function updateChart(restaurant_time) {
  const svgContainer = d3.select(".openTime");
  svgContainer.selectAll("*").remove();

  const svg = svgContainer
    .append("svg")
    //.attr("width", 300)
    .attr("height", 250)
    .append("g")
    .attr("class", "openTime")
    .attr("transform", "translate(40,60)");

  const xScale = d3.scaleBand().domain(days).range([0, 200]).padding(0.1);
  
  // 定义 yScale，范围从 0 (6:00) 到 21 (次日3:00)
  const yScale = d3.scaleLinear().domain([0, 21]).range([0, 180]);

  restaurant_time.forEach((restaurant, index) => {
    const extendedData = [];

    const allHoursPeriods = JSON.parse(restaurant.r_hours_periods);

    allHoursPeriods.forEach((period) => {
      let start = convertTimeToNormalized(parseTime(period.startTime));
      let end = convertTimeToNormalized(parseTime(period.endTime));

      extendedData.push({
        status: period.status,
        day: period.day,
        start: start,
        end: end,
      });
    });

    const barWidth = xScale.bandwidth() / 3; // 每个 bar 宽度为原来的三分之一

    svg
      .selectAll(".open-bar" + index)
      .data(extendedData)
      .enter()
      .append("rect")
      .attr("class", "open-bar open-bar-" + index)
      .attr("x", (d) => xScale(days[d.day - 1]) + barWidth * index)
      .attr("y", yScale(21)) // 初始设置于底部
      .attr("width", barWidth)
      .attr("height", 0) // 初始高度为0
      .attr("fill", colors[index]) // 使用指定的颜色
      .attr("opacity", 0.7)
      .transition() // 加入动画效果
      .duration(750)
      .attr("y", (d) => yScale(d.start))
      .attr("height", (d) => yScale(d.end) - yScale(d.start));
  });

  // 添加垂直分隔线
  days.forEach((day, i) => {
    if (i < days.length - 1) { // 不在最后一天添加线
      svg.append("line")
        .attr("x1", xScale(day) + xScale.bandwidth()) // 每天的右侧
        .attr("x2", xScale(day) + xScale.bandwidth()) // 相同的 x 位置
        .attr("y1", 0)
        .attr("y2", yScale(21))
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 2"); // 虚线
    }
  });

  // 修改 yAxis，使其从 6:00 开始，三小时为一间隔
  const yAxis = d3.axisLeft(yScale)
    .tickValues([0, 3, 6, 9, 12, 15, 18, 21])
    .tickFormat((d, i) => {
      const timeLabels = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "00:00", "03:00"];
      return timeLabels[i];
    });
  
  svg.append("g").attr("class", "axis").call(yAxis);

  const xAxis = d3.axisTop(xScale);
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0,0)")
    .call(xAxis);
}

export function highlightRestaurant(index) {
  d3.selectAll(".open-bar").classed("dim", true);
  d3.selectAll(".open-bar-" + index)
    .classed("highlight", true)
    .classed("dim", false);

  d3.select(`#button-${restaurantIds[index]}`)
    .style("background-color", colors[index])
    .style("color", "#fff");
}

export function resetHighlight() {
  d3.selectAll(".open-bar").classed("dim", false).classed("highlight", false);

  d3.selectAll(".button-container button")
    .style("background-color", "#f0f0f0")
    .style("color", "#000");
}

export function showRestaurantData(restaurantId) {
  const hoursPeriods = data[restaurantId];
  updateChart([hoursPeriods]);

  document.querySelectorAll(".button-container button").forEach((button) => {
    button.classList.remove("selected");
  });
  document.getElementById(`button-${restaurantId}`).classList.add("selected");
}

document.addEventListener("DOMContentLoaded", () => {
  updateChart(Object.values(restaurant_time)); // 显示所有餐厅的详细营业时间
});

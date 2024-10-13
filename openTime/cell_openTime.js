function updateChart(restaurant_time) {
  const svgContainer = d3.select(".openTime");
  svgContainer.selectAll("*").remove();

  // 获取页面宽度
  const containerWidth = svgContainer.node().clientWidth; // 获取容器宽度
  const margin = { top: 10, right: 40, bottom: 10, left: 40 }; // 调小 top margin
  const svgWidth = containerWidth - margin.left - margin.right;

  // 动态计算最大 Y 值的高度 (21 = 6:00-3:00)
  let maxYValue = 21; 

  // 定义 yScale，范围从 0 (6:00) 到 21 (次日3:00)
  const yScale = d3.scaleLinear().domain([0, maxYValue]).range([-20, 500]); 

  // 设置xScale的范围为当前svg宽度，并增加 padding 使其居中
  const xScale = d3.scaleBand().domain(days).range([0, svgWidth]).padding(0.3);

  // 计算水平偏移量以居中图表
  const translateX = (svgContainer.node().clientWidth - svgWidth) / 2;

  const svg = svgContainer
    .append("svg")
    .attr("width", "100%") // 使SVG宽度自适应页面
    .append("g")
    .attr("class", "openTime")
    .attr("transform", `translate(${translateX},${margin.top})`); // 动态计算水平居中偏移量

  restaurant_time.forEach((restaurant, index) => {
    const extendedData = [];

    const allHoursPeriods = JSON.parse(restaurant.r_hours_periods);

    allHoursPeriods.forEach((period) => {
      let start = convertTimeToNormalized(parseTime(period.startTime));
      let end = convertTimeToNormalized(parseTime(period.endTime));

      // 更新最大Y值，计算最大条的高度
      if (end > maxYValue) {
        maxYValue = end;
      }

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
      .attr("y", yScale(maxYValue)) // 初始设置于底部
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
        .attr("y2", yScale(maxYValue))
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

  // 动态更新 SVG 高度
  const calculatedHeight = yScale(0) - yScale(maxYValue);
  svgContainer.select("svg").attr("height", calculatedHeight + margin.top + margin.bottom);
}

// 这里是示例的转换函数，用于解析时间字符串
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

// 转换为归一化的时间（例如：6:00 -> 0，3:00 -> 21）
function convertTimeToNormalized(time) {
  const hour = time.hours;
  const normalizedTime = hour >= 6 ? hour - 6 : hour + 18;
  return normalizedTime;
}

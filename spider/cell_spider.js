const NUM_OF_SIDES = 4;
const NUM_OF_LEVEL = 5;
const margin = 0; // 增加邊距
const spider_width = window.innerWidth; // 設置寬度為頁面寬度
const spider_height = 250; // 設置固定高度
const size = Math.min(spider_width, spider_height) - margin * 2; // 使用固定的寬度和高度
const offset = Math.PI;
const polyangle = (Math.PI * 2) / NUM_OF_SIDES;
const r = 0.8 * size;
const r_0 = r / 2.5;
const shiftX = spider_width / 2 - 15; // 中心點位置
const shiftY = spider_height / 2 + 20; // 固定高度的中心點位置
const center = {
  x: 0,
  y: 0,
};

// 計算多邊形頂點座標
const calculatePolygonPoints = (numSides, radius, centerX, centerY, offset) => {
  const points = [];
  const angleStep = (Math.PI * 2) / numSides;

  for (let i = 0; i < numSides; i++) {
    const angle = i * angleStep + offset;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }

  return points;
};

// 使用上面的函數計算頂點
const points = calculatePolygonPoints(
  NUM_OF_SIDES,
  r,
  center.x,
  center.y,
  offset
);

// 將第一個點添加到末尾以閉合多邊形
points.push(points[0]);

// 繪製多邊形的函數
const drawPath = (points, g) => {
  const lineGenerator = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y);

  g.append("path")
    .attr("d", lineGenerator(points))
    .attr("fill", "none")
    .attr("stroke", "black");
};

// 繪製多邊形
const svg_spider = d3
  .select("svg.spider")
  .attr("width", spider_width) // 確保設置為固定寬度
  .attr("height", spider_height); // 確保設置為固定高度

const g = svg_spider
  .append("g")
  .attr("transform", `translate(${shiftX}, ${shiftY})`); // 使用頁面寬度置中

// 繪製雷達圖表格的函數
const generateAndDrawLevels = (levelsCount, sideCount) => {
  for (let level = 1; level <= levelsCount; level++) {
    const hyp = (level / levelsCount) * r_0;

    const points = [];
    for (let vertex = 0; vertex < sideCount; vertex++) {
      const theta = vertex * polyangle;

      points.push({
        x: center.x + hyp * Math.cos(theta),
        y: center.y + hyp * Math.sin(theta),
      });
    }

    const group = g.append("g").attr("class", "levels");

    const path = group
      .append("path")
      .attr(
        "d",
        d3
          .line()
          .x((d) => d.x)
          .y((d) => d.y)([...points, points[0]])
      )
      .attr("fill", "none")
      .attr("stroke", level === levelsCount ? "#000000" : "#9D9D9D") // 最外層的線條顏色較深
      .attr("stroke-width", 0.4);
  }
};

// 餐廳顏色
const color = d3.scaleOrdinal().range(["#FF70AE", "#85B4FF", "#FFCE47"]);

// 繪製餐廳評分的函數
const DrawRate = (levelsCount, sideCount, ratingsData, index) => {
  const scale = d3
    .scaleLinear()
    .domain([0, 5]) // 假設評分範圍為0到5
    .range([0, r_0]);

  const points = [];
  for (let vertex = 0; vertex < sideCount; vertex++) {
    const theta = vertex * polyangle;
    const value = ratingsData[vertex].value;

    points.push({
      x: center.x + scale(value) * Math.cos(theta),
      y: center.y + scale(value) * Math.sin(theta),
    });
  }

  const group = g.append("g").attr("class", `levels_rate restaurant-${index}`);

  drawPath([...points, points[0]], group);

  // 添加小點點
  group
    .selectAll("circle")
    .data(points)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 3) // 小點點的半徑
    .attr("fill", color(index - 1)) // 顏色與對應的多邊形相同
    .style("fill-opacity", 1);
};

// 繪製1~5顆星刻度的函數
const drawAxisTicks = (
  levelsCount,
  sideCount,
  radius,
  centerX,
  centerY,
  offset
) => {
  const group = g.append("g").attr("class", "axis-ticks");

  for (let level = 1; level <= levelsCount; level++) {
    const hyp = (level / levelsCount) * radius;
    const points = calculatePolygonPoints(
      sideCount,
      hyp,
      centerX,
      centerY,
      offset
    );

    points.forEach((point, i) => {
      if (i === 3) {
        point.x += 3; // 右移
        group
          .append("text")
          .attr("x", point.x)
          .attr("y", point.y)
          .attr("dy", "-0.35em")
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", "black")
          .text(level);
      }
    });
  }
};

// 繪製餐廳星級相連線的函數
const generateAndDrawLines = (sideCount) => {
  const group = g.append("g").attr("class", "grid-lines");

  for (let vertex = 1; vertex <= sideCount; vertex++) {
    const theta = vertex * polyangle;
    const point = {
      x: center.x + r_0 * Math.cos(theta),
      y: center.y + r_0 * Math.sin(theta),
    };

    drawPath([center, point], group);
  }
};

// 添加標籤的函數
const addLabels = () => {
  const labels = ["食物", "服務", "划算", "衛生"];
  const labelOffset = 15; // 用來調整標籤位置的偏移量
  const labelPoints = calculatePolygonPoints(
    NUM_OF_SIDES,
    r_0 + labelOffset,
    center.x,
    center.y,
    offset
  );

  labelPoints.forEach((point, index) => {
    g.append("text")
      .attr("x", point.x)
      .attr("y", point.y)
      .attr("dy", "0.3em")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text(labels[index]);
  });
};

let isLocked = false; // 用來跟踪按鈕是否被鎖定

// 定义在 openTime.js 中导出的 highlight 和 reset 函数
import { highlightRestaurant, resetHighlight } from "../openTime/openTime.js";

// 添加button到左上角的函數
const addButtons = (restaurantNames) => {
  const buttonColors = ["#FF70AE", "#85B4FF", "#FFCE47"];
  const buttonGroup = svg_spider
    .append("g")
    .attr("transform", `translate(${margin},${margin})`);
  let xPosition = 10;
  let yPosition = 10;
  const buttonWidth = 35; // 初始按鈕寬度
  const buttonHeight = 23; // 初始按鈕高度
  const buttonPositions = []; // 保存每個按鈕的初始 xPosition

  restaurantNames.forEach((name, i) => {
    let Punctuation = name.length;
    if (name.includes("-")) Punctuation = Punctuation - 2;
    else if (name.includes("(")) Punctuation = Punctuation - 1.5;
    const expandedWidth = Punctuation * 14.5 + 15; // 动态计算扩展后的按钮宽度

    buttonPositions.push(xPosition); // 记录每个按钮的初始 xPosition

    const buttonContainer = buttonGroup
      .append("g")
      .attr("class", `button-container-${i + 1}`)
      .attr("transform", `translate(${xPosition},${yPosition})`)
      .style("cursor", "default")
      .on("click", function () {
        if (!isLocked) {
          // 设置当前按钮和雷达图为选中状态
          d3.select(this)
            .select("rect")
            .transition()
            .duration(100)
            .style("fill-opacity", 1)
            .attr("width", expandedWidth);

          // 移动右边的按钮
          for (let j = i + 1; j < restaurantNames.length; j++) {
            d3.select(`.button-container-${j + 1}`)
              .transition()
              .duration(100)
              .attr(
                "transform",
                `translate(${
                  buttonPositions[j] + (expandedWidth - buttonWidth)
                },${yPosition})`
              );
          }

          // 显示餐厅名称
          d3.select(this)
            .select("text")
            .transition()
            .duration(100)
            .style("visibility", "visible");

          // 将选中的雷达图移到最上层
          d3.select(`.levels_rate.restaurant-${i + 1}`).raise();

          // 修改雷达图样式
          d3.select(`.levels_rate.restaurant-${i + 1} path`)
            .transition()
            .duration(100)
            .style("fill-opacity", 0.5);

          d3.selectAll(`.levels_rate:not(.restaurant-${i + 1}) path`).style(
            "fill-opacity",
            0.1
          );

          // 变深色的小圆点
          d3.selectAll(`.levels_rate.restaurant-${i + 1} circle`)
            .transition()
            .duration(100)
            .style("fill-opacity", 1);

          d3.selectAll(`.levels_rate:not(.restaurant-${i + 1}) circle`)
            .transition()
            .duration(100)
            .style("fill-opacity", 0.2);

          // 确保刻度层仍然在最上层
          d3.select(".axis-ticks").raise();
          isLocked = true;
          highlightRestaurant(i);
        } else {
          // 如果已经有按钮被锁定，再次点击解锁
          resetButtonState(this, buttonWidth, i, yPosition, buttonPositions);
          isLocked = false;
        }
      });

    buttonContainer
      .append("rect")
      .attr("width", buttonWidth)
      .attr("height", buttonHeight)
      .attr("fill", buttonColors[i])
      .style("fill-opacity", 0.5)
      .attr("rx", 5) // 设置圆角半径
      .attr("ry", 5) // 设置圆角半径
      .style("cursor", "pointer"); // 设置游标为默认样式

    buttonContainer
      .append("text")
      .attr("x", 10)
      .attr("y", buttonHeight / 1.3)
      .attr("class", `button-text-${i + 1}`)
      .style("visibility", "hidden")
      .attr("font-size", 14)
      .style("cursor", "pointer") // 设置游标为默认样式
      .text(name);

    xPosition += buttonWidth + 10; // 更新 xPosition 以便放置下一个按钮
  });
};

// 重置按钮和雷达图状态的函数
function resetButtonState(button, buttonWidth, index, yPosition, buttonPositions) {
  d3.select(button)
    .select("rect")
    .transition()
    .duration(100)
    .style("fill-opacity", 0.5)
    .attr("width", buttonWidth);

  // 恢复右边按钮的位置
  for (let j = index + 1; j < restaurantNames.length; j++) {
    d3.select(`.button-container-${j + 1}`)
      .transition()
      .duration(100)
      .attr("transform", `translate(${buttonPositions[j]},${yPosition})`);
  }

  // 隐藏餐厅名称
  d3.select(button).select("text").style("visibility", "hidden");

  // 雷达图恢复
  d3.selectAll(`.levels_rate path`).style("fill-opacity", 0);

  // 小圆点恢复
  d3.selectAll(`.levels_rate circle`)
    .transition()
    .duration(100)
    .style("fill-opacity", 1);
}

// 解析資料
const restaurantNames = restaurant_data.map((d) => d.r_name);
const ratingsData = restaurant_data.map((d) => [
  { label: "食物", value: isNaN(+d.r_rating_food) ? 0 : +d.r_rating_food },
  { label: "服務", value: isNaN(+d.r_rate_service) ? 0 : +d.r_rate_service },
  { label: "划算", value: isNaN(+d.r_rate_value) ? 0 : +d.r_rate_value },
  { label: "衛生", value: isNaN(+d.r_rate_clean) ? 0 : +d.r_rate_clean },
]);

// 繪製雷達圖
ratingsData.forEach((ratingData, i) => {
  DrawRate(NUM_OF_LEVEL, NUM_OF_SIDES, ratingData, i + 1);
});

// 添加按鈕和其他元素
addButtons(restaurantNames);
drawAxisTicks(NUM_OF_LEVEL, NUM_OF_SIDES, r_0, center.x, center.y, offset);
generateAndDrawLevels(NUM_OF_LEVEL, NUM_OF_SIDES);
generateAndDrawLines(NUM_OF_SIDES);
addLabels();

console.log(restaurant_data); // 檢查資料
console.log(d3.selectAll(".levels_rate path")); // 檢查選擇器是否正確應用

// css
// 將 spider chart 表格的線變成淺灰色
d3.selectAll(".grid-lines path").style("stroke", "#D3D3D3");
d3.selectAll(".levels path").style("stroke", "#9D9D9D");
d3.selectAll(".levels_rate path")
  .style("stroke", function (d, i) {
    return color(i); // 根據索引應用顏色
  })
  .attr("stroke-width", 1.5)
  .style("fill", function (d, i) {
    return color(i); // 根據索引應用顏色
  })
  .style("fill-opacity", 0);

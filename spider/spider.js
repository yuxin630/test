const NUM_OF_SIDES = 4;
const NUM_OF_LEVEL = 5;
const margin = 0; // 增加邊距
const spider_width = 270; // 設置固定寬度
const spider_height = 250; // 設置固定高度
const size = Math.min(spider_width, spider_height) - margin * 2; // 使用固定的寬度和高度
const offset = Math.PI;
const polyangle = (Math.PI * 2) / NUM_OF_SIDES;
const r = 0.8 * size;
const r_0 = r / 2.5;
const shiftX = 80; // 用于调整图表水平位置的偏移量
const shiftY = 50;
const center = {
  x: size / 2 + margin - shiftX,
  y: size / 2 + 5 - shiftY,
};

// const tooltip = d3.select("svg.spider");

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

// 假設 drawPath 是一個函數，用於繪製多邊形路徑
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
  .attr("transform", `translate(${margin + 80},${margin + 65})`);

//畫出spider chart 表格
const generateAndDrawLevels = (levelsCount, sideCount) => {
  for (let level = 1; level <= levelsCount; level++) {
    // if (level > 2) {
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
    // }
  }
};

//餐廳顏色
const color = d3.scaleOrdinal().range(["#FF70AE", "#85B4FF", "#FFCE47"]); //紅、藍、黃
// .range(["#84C1FF", "#96FED1", "#FFA5A0"]); //藍色、紫色、粉紅色

//餐廳評分
const DrawRate = (levelsCount, sideCount, ratingsData, index) => {
  const scale = d3
    .scaleLinear()
    .domain([0, 5]) // Assuming ratings are from 0 to 5
    .range([0, r_0]);

  const hyp = (index / levelsCount) * r_0;
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

// 1~5顆星 刻度
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
        // console.log(point.x)

        // console.log(i)
        // 调整刻度位置
        // if (i == 1) { // 顶部点
        // point.x -= 4; // 左移
        // } else if (i == 3) { // 底部点
        //     point.y -= 3;
        point.x += 3; // 右移
        // }
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

//該餐廳星級 相連在一起
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

//添加標籤
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
let isLocked = false; // 全局變數，用來跟踪按鈕是否被鎖定

// 定义一个全局变量存储餐厅ID
const restaurantIds = [
  /* 餐厅 ID 列表 */
];

// 定义在 openTime.js 中导出的 highlight 和 reset 函数
import { highlightRestaurant, resetHighlight } from "../openTime/openTime.js";

//添加button到左上角 要把button跟文字包在一起 動態才會正常
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
    const expandedWidth = Punctuation * 14.5 + 15; // 動態計算擴展後的按鈕寬度

    buttonPositions.push(xPosition); // 記錄每個按鈕的初始 xPosition

    const buttonContainer = buttonGroup
      .append("g")
      .attr("class", `button-container-${i + 1}`)
      .attr("transform", `translate(${xPosition},${yPosition})`)
      .style("cursor", "default")
      .on("mouseover", function (event, d) {
        if (!isLocked) {
          // 變深色並擴展寬度
          d3.select(this)
            .select("rect")
            .transition()
            .duration(100)
            .style("fill-opacity", 1)
            .style("cursor", "default")
            .attr("width", expandedWidth);

          // 移動右邊的按鈕
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

          // 顯示餐廳名稱
          d3.select(this)
            .select("text")
            .transition()
            .duration(100)
            .style("visibility", "visible");

          // 變深色並將選中的雷達圖移到最上層
          d3.select(`.levels_rate.restaurant-${i + 1}`).raise();

          // 變深色
          d3.select(`.levels_rate.restaurant-${i + 1} path`)
            .transition()
            .duration(100)
            .style("fill-opacity", 0.5);

          // 修改其他雷達圖樣式
          d3.selectAll(`.levels_rate:not(.restaurant-${i + 1}) path`).style(
            "fill-opacity",
            0.1
          );

          // 變深色的小點點
          d3.selectAll(`.levels_rate.restaurant-${i + 1} circle`)
            .transition()
            .duration(100)
            .style("fill-opacity", 1);

          // 其他雷達圖和小點點變淡
          d3.selectAll(`.levels_rate:not(.restaurant-${i + 1}) path`).style(
            "fill-opacity",
            0.1
          );

          d3.selectAll(`.levels_rate:not(.restaurant-${i + 1}) circle`)
            .transition()
            .duration(100)
            .style("fill-opacity", 0.2);

          // 確保刻度層仍然在最上層
          d3.select(".axis-ticks").raise();
          highlightRestaurant(i);
        }
      })
      .on("mouseleave", function (event, d) {
        if (!isLocked) {
          // 恢復樣式
          d3.select(this)
            .select("rect")
            .style("fill-opacity", 0.5)
            .style("cursor", "default")
            .attr("width", buttonWidth);

          // 恢復右邊按鈕的位置
          for (let j = i + 1; j < restaurantNames.length; j++) {
            d3.select(`.button-container-${j + 1}`)
              .transition()
              .duration(100)
              .attr(
                "transform",
                `translate(${buttonPositions[j]},${yPosition})`
              );
          }

          // 隱藏餐廳名稱
          d3.select(this).select("text").style("visibility", "hidden");

          // // 恢復雷達圖順序
          // originalOrder.forEach(function (element) {
          //     d3.select(element).raise();
          // });

          // 雷達圖恢復
          d3.selectAll(`.levels_rate path`).style("fill-opacity", 0);

          // 小點點恢復
          d3.selectAll(`.levels_rate circle`)
            .transition()
            .duration(100)
            .style("fill-opacity", 1);
          resetHighlight();
        }
      })
      .on("click", function (event, d) {
        if (!isLocked) {
          // 變深色並擴展寬度
          d3.select(this)
            .select("rect")
            .transition()
            .duration(100)
            .style("fill-opacity", 1)
            .style("cursor", "default")
            .attr("width", expandedWidth);

          // 移動右邊的按鈕
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

          // 顯示餐廳名稱
          d3.select(this)
            .select("text")
            .transition()
            .duration(100)
            .style("visibility", "visible");

          // 變深色並將選中的雷達圖移到最上層
          d3.select(`.levels_rate.restaurant-${i + 1}`).raise();

          // 變深色
          d3.select(`.levels_rate.restaurant-${i + 1} path`)
            .transition()
            .duration(100)
            .style("fill-opacity", 0.5);

          // 修改其他雷達圖樣式
          d3.selectAll(`.levels_rate:not(.restaurant-${i + 1}) path`).style(
            "fill-opacity",
            0.1
          );

          // 變深色的小點點
          d3.selectAll(`.levels_rate.restaurant-${i + 1} circle`)
            .transition()
            .duration(100)
            .style("fill-opacity", 1);

          // 其他雷達圖和小點點變淡
          d3.selectAll(`.levels_rate:not(.restaurant-${i + 1}) path`).style(
            "fill-opacity",
            0.1
          );

          d3.selectAll(`.levels_rate:not(.restaurant-${i + 1}) circle`)
            .transition()
            .duration(100)
            .style("fill-opacity", 0.2);

          // 確保刻度層仍然在最上層
          d3.select(".axis-ticks").raise();
          isLocked = true;
          highlightRestaurant(i);
          console.log("isLocked:", !isLocked);
        } else {
          // 解鎖狀態，恢復所有按鈕的 hover 事件
          // 恢復樣式
          d3.select(this)
            .select("rect")
            .style("fill-opacity", 0.5)
            .style("cursor", "default")
            .attr("width", buttonWidth);

          // 恢復右邊按鈕的位置
          for (let j = i + 1; j < restaurantNames.length; j++) {
            d3.select(`.button-container-${j + 1}`)
              .transition()
              .duration(100)
              .attr(
                "transform",
                `translate(${buttonPositions[j]},${yPosition})`
              );
          }

          // 隱藏餐廳名稱
          d3.select(this).select("text").style("visibility", "hidden");

          // 雷達圖恢復
          d3.selectAll(`.levels_rate path`).style("fill-opacity", 0);

          // 小點點恢復
          d3.selectAll(`.levels_rate circle`)
            .transition()
            .duration(100)
            .style("fill-opacity", 1);
          isLocked = false;
          resetHighlight();
        }
      });

    buttonContainer
      .append("rect")
      .attr("width", buttonWidth)
      .attr("height", buttonHeight)
      .attr("fill", buttonColors[i])
      .style("fill-opacity", 0.5)
      .attr("rx", 5) // 設置圓角半徑
      .attr("ry", 5) // 設置圓角半徑
      .style("cursor", "pointer"); // 設置游標為默認樣式

    buttonContainer
      .append("text")
      .attr("x", 10)
      .attr("y", buttonHeight / 1.3)
      .attr("class", `button-text-${i + 1}`)
      .style("visibility", "hidden")
      .attr("font-size", 14)
      .style("cursor", "pointer") // 設置游標為默認樣式
      .text(name);

    xPosition += buttonWidth + 10; // 更新 xPosition 以便放置下一個按鈕
  });
};

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
  console.log(`Rating Data for Restaurant ${i + 1}:`, ratingData);
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

// // Read the data from CSV
// d3.json("../connect_sql/get_data_json.php").then(function (data) {
//     // console.log(data);

//     const restaurantNames = data.slice(5, 8).map(d => d.r_name); // 獲取前三個餐廳的名稱\

//     // 假設我們只需要前三個餐廳的信息來生成 spider chart
//     const ratingsData1 = [
//         { label: "食物", value: +data[5].r_rating_food },
//         { label: "服務", value: +data[5].r_rate_service },
//         { label: "划算度", value: +data[5].r_rate_value },
//         { label: "衛生", value: +data[5].r_rate_clean }
//     ];

//     const ratingsData2 = [
//         { label: "食物", value: +data[6].r_rating_food },
//         { label: "服務", value: +data[6].r_rate_service },
//         { label: "划算度", value: +data[6].r_rate_value },
//         { label: "衛生", value: +data[6].r_rate_clean }
//     ];

//     const ratingsData3 = [
//         { label: "食物", value: +data[7].r_rating_food },
//         { label: "服務", value: +data[7].r_rate_service },
//         { label: "划算度", value: +data[7].r_rate_value },
//         { label: "衛生", value: +data[7].r_rate_clean }
//     ];

//     // 畫出評分
//     DrawRate(NUM_OF_LEVEL, NUM_OF_SIDES, ratingsData1, 1);
//     DrawRate(NUM_OF_LEVEL, NUM_OF_SIDES, ratingsData2, 2);
//     DrawRate(NUM_OF_LEVEL, NUM_OF_SIDES, ratingsData3, 3);

//     //add button
//     addButtons(restaurantNames); // 傳遞餐廳名稱給 addButtons 函數

//     generateAndDrawLevels(NUM_OF_LEVEL, NUM_OF_SIDES);
//     generateAndDrawLines(NUM_OF_SIDES);
//     drawAxisTicks(NUM_OF_LEVEL, 4, r_0, center.x, center.y, offset);
//     // 添加標籤
//     addLabels();
//     // 添加刻度
//     // drawAxis( ticks, NUM_OF_LEVEL );

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

// }).catch(function (error) {
//     console.error("Error loading data: ", error);
// });

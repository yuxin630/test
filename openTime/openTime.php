<?php

// 資料庫連線設置
$host = 'localhost';
$dbuser = 'root';
$dbpassword = '';
$dbname = 'foodee';

// 建立資料庫連線
$link = mysqli_connect($host, $dbuser, $dbpassword, $dbname);

// 初始化變數
$all_restaurant_data = [];
$restaurant_ids = [];
$restaurant_names = [];

if ($link) {
    mysqli_query($link, 'SET NAMES utf8');

    // 從 URL 查詢參數獲取餐廳 ID
    for ($i = 1; $i <= 3; $i++) {
        if (isset($_GET["r_id$i"])) {
            $r_id = intval($_GET["r_id$i"]);
            $restaurant_ids[] = $r_id;

            // 查詢每個餐廳的名稱
            $query_name = "SELECT r_name FROM detail2 WHERE r_id = $r_id";
            $result_name = mysqli_query($link, $query_name);

            if ($result_name) {
                $row_name = mysqli_fetch_assoc($result_name);
                $restaurant_names[$r_id] = $row_name['r_name'];
            } else {
                echo "Error in query: " . mysqli_error($link);
                $restaurant_names[$r_id] = 'Unknown';
            }

            // 查詢每個餐廳的營業時間
            $query_hours = "SELECT r_hours_periods FROM detail2 WHERE r_id = $r_id";
            $result_hours = mysqli_query($link, $query_hours);

            if ($result_hours) {
                $row_hours = mysqli_fetch_assoc($result_hours);
                // 檢查 r_hours_periods 是否是合法的 JSON 格式
                $r_hours_periods = str_replace("'", '"', $row_hours['r_hours_periods']);
                if (json_decode($r_hours_periods) !== null) {
                    $all_restaurant_data[$r_id] = $r_hours_periods;
                } else {
                    echo "Invalid JSON format for r_hours_periods in restaurant ID: $r_id";
                    $all_restaurant_data[$r_id] = null;
                }
            } else {
                echo "Error in query: " . mysqli_error($link);
                $all_restaurant_data[$r_id] = null;
            }
        }
    }
} else {
    echo "Failed to connect to the database: " . mysqli_connect_error();
}
mysqli_close($link);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restaurant Hours</title>
    <link rel="stylesheet" href="../openTime/openTime.css">
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        .button-container {
            display: flex;
            flex-wrap: wrap;
        }
        .button-container button {
            margin: 5px;
            padding: 10px;
            position: relative;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            max-width: 150px;
            cursor: pointer;
            background-color: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 5px;
            transition: background-color 0.3s, color 0.3s;
        }
        .button-container button:hover {
            color: #fff;
        }
        .chart-container {
            width: auto;
        }
        .highlight {
            opacity: 1 !important;
        }
        .dim {
            opacity: 0.2;
        }
    </style>
</head>
<body>
    <div class="button-container">
        <?php if (!empty($restaurant_ids)): ?>
            <?php foreach ($restaurant_ids as $index => $r_id): ?>
                <button id="button-<?php echo $r_id; ?>" 
                        onmouseover="highlightRestaurant(<?php echo $index; ?>)" 
                        onmouseout="resetHighlight()">
                        <!--onclick="showRestaurantData(<//?php echo $r_id; ?>)"-->
                    <?php echo htmlspecialchars($restaurant_names[$r_id]); ?>
                </button>
            <?php endforeach; ?>
        <?php else: ?>
            <p>No restaurants found.</p>
        <?php endif; ?>
    </div>

    <div id="chart" class="chart-container"></div>

    <script>
        const parseTime = d3.timeParse("%H%M");
        const formatTime = d3.timeFormat("%H:%M");
        const days = ['1', '2', '3', '4', '5', '6', '7'];

        const data = <?php echo json_encode($all_restaurant_data); ?>;
        const restaurantNames = <?php echo json_encode($restaurant_names); ?>;
        const colors = ['#d62828', '#00a896', '#5fa8d3'];  // 為三家餐廳指定紅色、綠色和藍色

        function updateChart(restaurantsData) {
            const svgContainer = d3.select("#chart");
            svgContainer.selectAll("*").remove();

            const svg = svgContainer.append("svg")
                .attr("width", 400)
                .attr("height", 400)
                .append("g")
                .attr("transform", "translate(50,50)");

            const xScale = d3.scaleBand().domain(days).range([0, 300]).padding(0.1);
            const yScale = d3.scaleTime()
                .domain([parseTime("0000"), parseTime("2400")])
                .range([0, 300]);

            restaurantsData.forEach((hoursPeriods, index) => {
                const extendedData = [];

                const allHoursPeriods = JSON.parse(hoursPeriods);

                allHoursPeriods.forEach(period => {
                    let start = parseTime(period.startTime);
                    let end = parseTime(period.endTime);
                    if (end < start) {
                        extendedData.push({
                            status: period.status,
                            day: period.day,
                            start: start,
                            end: parseTime("2400"),
                            nextDay: true
                        });
                        extendedData.push({
                            status: period.status,
                            day: (period.day % 7) + 1,
                            start: parseTime("0000"),
                            end: end,
                            nextDay: true
                        });
                    } else {
                        extendedData.push({
                            status: period.status,
                            day: period.day,
                            start: start,
                            end: end,
                            nextDay: false
                        });
                    }
                });

                svg.selectAll(".open-bar" + index)
                    .data(extendedData)
                    .enter().append("rect")
                    .attr("class", "open-bar open-bar-" + index)
                    .attr("x", d => xScale(days[d.day - 1]))
                    .attr("y", yScale(parseTime("2400")))  // 初始設置於底部
                    .attr("width", xScale.bandwidth())
                    .attr("height", 0)  // 初始高度為0
                    .attr("fill", colors[index])  // 使用指定的顏色
                    .attr("opacity", 0.7)
                    .transition()  // 加入動畫效果
                    .duration(750)
                    .attr("y", d => yScale(d.start))
                    .attr("height", d => yScale(d.end) - yScale(d.start));
            });

            const yAxis = d3.axisLeft(yScale).tickFormat(formatTime);
            svg.append("g")
                .attr("class", "axis")
                .call(yAxis);

            const xAxis = d3.axisTop(xScale);
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0,0)")
                .call(xAxis);
        }

        function highlightRestaurant(index) {
            d3.selectAll('.open-bar').classed('dim', true);
            d3.selectAll('.open-bar-' + index).classed('highlight', true).classed('dim', false);
            
            // 將按鈕顏色與圖表顏色對應
            d3.select(`#button-${restaurantIds[index]}`)
                .style("background-color", colors[index])
                .style("color", "#fff");
        }

        function resetHighlight() {
            d3.selectAll('.open-bar').classed('dim', false).classed('highlight', false);

            // 恢復按鈕原色
            d3.selectAll('.button-container button')
                .style("background-color", "#f0f0f0")
                .style("color", "#000");
        }

        function showRestaurantData(restaurantId) {
            const hoursPeriods = data[restaurantId];
            updateChart([hoursPeriods]);

            // Highlight the selected button
            document.querySelectorAll('.button-container button').forEach(button => {
                button.classList.remove('selected');
            });
            document.getElementById(`button-${restaurantId}`).classList.add('selected');
        }

        document.addEventListener('DOMContentLoaded', () => {
            updateChart(Object.values(data));  // 顯示所有餐廳的詳細營業時間
        });

        const restaurantIds = <?php echo json_encode($restaurant_ids); ?>;
    </script>
</body>
</html>

<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// 數據庫設置
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "foodee";

// 建立數據庫連接
$conn = new mysqli($servername, $username, $password, $dbname);

// 檢查連接
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// 初始 SQL 查詢
$sql = "
SELECT 
    additional_.*, 
    detail.*, 
    photos.*, 
    review.*
FROM 
    additional_
JOIN 
    detail ON additional_.r_id = detail.r_id
JOIN 
    photos ON additional_.r_id = photos.r_id
JOIN 
    review ON additional_.r_id = review.r_id
WHERE 1=1
";

// 新增篩選條件 - 根據 r_ids
if (isset($_GET['r_ids'])) {
    $rIds = explode(',', $_GET['r_ids']);
    $rIds = array_map('intval', $rIds); // 确保 r_id 是整数类型
    $rIdConditions = implode(',', $rIds);
    $sql .= " AND additional_.r_id IN ($rIdConditions)";
}

// 篩選條件 - 停車場
if (isset($_GET['hasParking'])) {
    $hasParking = intval($_GET['hasParking']);
    if ($hasParking === 1) {
        $sql .= " AND additional_.r_has_parking = 1";
    }
}
// 篩選條件 - 用餐時間
if (isset($_GET['min_time']) && isset($_GET['max_time'])) {
    $minTime = intval($_GET['min_time']);
    $maxTime = intval($_GET['max_time']);
    if (isset($_GET['no_limit']) && intval($_GET['no_limit']) === 1) {
        $sql .= " AND (additional_.r_time_low BETWEEN $minTime AND $maxTime OR additional_.r_time_low IS NULL OR additional_.r_time_low = '')";
    } else {
        $sql .= " AND additional_.r_time_low BETWEEN $minTime AND $maxTime";
    }
} else if (isset($_GET['no_limit']) && intval($_GET['no_limit']) === 1) {
    $sql .= " AND (additional_.r_time_low IS NULL OR additional_.r_time_low = '')";
}

// 篩選條件 - 評分
if (isset($_GET['ratings'])) {
    $ratings = explode(',', $_GET['ratings']);
    $ratings = array_map('floatval', $ratings);
    $ratingConditions = implode(' OR ', array_map(function($rating) {
        return "detail.r_rating = $rating";
    }, $ratings));
    $sql .= " AND ($ratingConditions)";
}
// 篩選條件 - 氣氛
if (isset($_GET['vibes'])) {
    $vibeList = explode(',', $_GET['vibes']);
    $vibeConditions = array_map(function($vibe) use ($conn) {
        return "additional_.r_vibe LIKE '%" . $conn->real_escape_string($vibe) . "%'";
    }, $vibeList);
    $sql .= " AND (" . implode(' OR ', $vibeConditions) . ")";
}
// 篩選條件 - 價格
if (isset($_GET['min_price']) && isset($_GET['max_price'])) {
    $minPrice = intval($_GET['min_price']);
    $maxPrice = intval($_GET['max_price']);
    $sql .= " AND r_price_low BETWEEN $minPrice AND $maxPrice";
}


// 篩選營業時間 - 根據 day 進行篩選
if (isset($_GET['selectedDays'])) {
    $selectedDays = explode(',', $_GET['selectedDays']);
    $selectedDays = array_map('ucfirst', $selectedDays); // 確保天數首字母大寫

    $dayConditions = implode(' OR ', array_map(function($day) {
        return "r_hours_weekday LIKE '%$day%'";
    }, $selectedDays));

    $sql .= " AND ($dayConditions)";
}


$result = $conn->query($sql);

if ($result === false) {
    echo json_encode(["error" => $conn->error]);
    $conn->close();
    exit;
}

$data = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

$conn->close();
echo json_encode($data);
?>
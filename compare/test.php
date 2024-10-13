<?php
$host = 'localhost';
$dbuser = 'root';
$dbpassword = '';
$dbname = 'foodee';
$link = mysqli_connect($host, $dbuser, $dbpassword, $dbname);

if ($link) {
    mysqli_query($link, 'SET NAMES utf8');

    // Get restaurant IDs from GET parameters
    $r_ids = [];
    for ($i = 1; $i <= 3; $i++) {
        if (isset($_GET["r_id$i"])) {
            $r_ids[] = intval($_GET["r_id$i"]);
        }
    }

    // Fetch images, names, vibes, dishes, and prices for each restaurant
    $all_restaurant_data = [];
    foreach ($r_ids as $r_id) {
        $query = "SELECT r_name, r_vibe, r_food_dishes, r_price_low, r_price_high, r_photo_env1, r_photo_env2, r_photo_env3, r_photo_food1, r_photo_food2, r_photo_food3, r_photo_food4, r_photo_food5, r_photo_door, r_photo_menu1, r_photo_menu2, r_photo_menu3 
                  FROM compare
                  WHERE r_id = $r_id";
        $result = mysqli_query($link, $query);

        if ($result) {
            $restaurant_data = mysqli_fetch_assoc($result);
            $all_restaurant_data[$r_id] = $restaurant_data;
        } else {
            echo "Error in query: " . mysqli_error($link);
            $all_restaurant_data[$r_id] = null;
        }
    }
} else {
    echo "Failed to connect to the database: " . mysqli_connect_error();
    $all_restaurant_data = null;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
    <div class="container">
        <div class="gallery-container">
            <?php
            // Helper function to render image gallery for each restaurant
            function renderGallerySection($r_id, $restaurant_data)
            {
                echo "<div class='gallery-section'>";
                echo "<div class='restaurant-name'>";
                echo "<div>" . htmlspecialchars($restaurant_data['r_name']) . "</div>";
                echo "</div>";

                // Display environment images
                echo "<h3>Environment</h3>";                
                echo "<div class='vibe-tags'>";
                if (!empty($restaurant_data['r_vibe'])) {
                    $vibes = explode(',', $restaurant_data['r_vibe']);
                    foreach ($vibes as $vibe) {
                        echo "<div class='restaurant-tag'>" . htmlspecialchars(trim($vibe)) . "</div>";
                    }
                }
                echo "</div>";
                echo "<div class='image-container'>";
                foreach (['r_photo_env1', 'r_photo_env2', 'r_photo_env3', 'r_photo_door'] as $index => $field) {
                    if (!empty($restaurant_data[$field])) {
                        $activeClass = $index === 0 ? 'active' : '';
                        echo "<img src='{$restaurant_data[$field]}' class='gallery-img $activeClass' onerror='this.onerror=null;this.src=\"fallback.jpg\";' onclick='openModal(this)' />";
                    }
                }
                echo "<span class='nav-arrow prev' onclick='prevImage(this)'>&#10094;</span>";
                echo "<span class='nav-arrow next' onclick='nextImage(this)'>&#10095;</span>";
                echo "</div>";

                // Display food images
                echo "<h3>Food</h3>";
                echo "<div class='food-tags'>";
                if (!empty($restaurant_data['r_food_dishes'])) {
                    $dishes = explode(',', $restaurant_data['r_food_dishes']);
                    foreach ($dishes as $dish) {
                        echo "<div class='restaurant-tag'>" . htmlspecialchars(trim($dish)) . "</div>";
                    }
                }
                echo "</div>";
                echo "<div class='image-container'>";
                foreach (['r_photo_food1', 'r_photo_food2', 'r_photo_food3', 'r_photo_food4', 'r_photo_food5'] as $index => $field) {
                    if (!empty($restaurant_data[$field])) {
                        $activeClass = $index === 0 ? 'active' : '';
                        echo "<img src='{$restaurant_data[$field]}' class='gallery-img $activeClass' onerror='this.onerror=null;this.src=\"fallback.jpg\";' onclick='openModal(this)' />";
                    }
                }
                echo "<span class='nav-arrow prev' onclick='prevImage(this)'>&#10094;</span>";
                echo "<span class='nav-arrow next' onclick='nextImage(this)'>&#10095;</span>";
                echo "</div>";

                // Display price range
                echo "<h3>MENU</h3>";
                echo "<div class='vibe-tags'>";
                if (!empty($restaurant_data['r_price_low']) && !empty($restaurant_data['r_price_high'])) {
                    echo "<div class='price-tag'>Price Range: $" . htmlspecialchars($restaurant_data['r_price_low']) . " ~ $" . htmlspecialchars($restaurant_data['r_price_high']) . "</div>";
                }
                echo "</div>";
                echo "<div class='image-container'>";
                foreach (['r_photo_menu1', 'r_photo_menu2', 'r_photo_menu3'] as $index => $field) {
                    if (!empty($restaurant_data[$field])) {
                        $activeClass = $index === 0 ? 'active' : '';
                        echo "<img src='{$restaurant_data[$field]}' class='gallery-img $activeClass' onerror='this.onerror=null;this.src=\"fallback.jpg\";' onclick='openModal(this)' />";
                    }
                }
                echo "<span class='nav-arrow prev' onclick='prevImage(this)'>&#10094;</span>";
                echo "<span class='nav-arrow next' onclick='nextImage(this)'>&#10095;</span>";
                echo "</div>";

                echo "</div>";
            }

            if ($all_restaurant_data) {
                foreach ($all_restaurant_data as $r_id => $restaurant_data) {
                    if ($restaurant_data) {
                        renderGallerySection($r_id, $restaurant_data);
                    } else {
                        echo "<p>No data available for restaurant ID: $r_id.</p>";
                    }
                }
            } else {
                echo "<p>No data available for the given restaurant IDs.</p>";
            }
            ?>
        </div>
        <div class="info-container">
            <!-- This section can be used for additional content as per your design. -->
            <!-- <h2>Additional Information</h2> -->
            <div>
                <svg class="word_tree" width="400" height="200"></svg>
                <svg class="spider" width="300" height="300"></svg>
            <div id = "map">
                <svg class="map" width ="600" height = "400"></svg>
            </div>
                <script type="module">
                    import '../word_tree/word_tree_modify.js';
                    import '../spider/spider.js';
                    import '../map/compare_map.js'
                </script>
            </div>
            <!-- <p>Details, charts, and other elements can go here.</p> -->
        </div>
    </div>

    <!-- The Modal -->
    <div id="imageModal" class="modal">
        <span class="modal-close" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImg">
        <span class="modal-prev" onclick="prevModalImage()">&lt;</span>
        <span class="modal-next" onclick="nextModalImage()">&gt;</span>
    </div>

    <script>
        function openModal(element) {
            var modal = document.getElementById("imageModal");
            var modalImg = document.getElementById("modalImg");
            modal.style.display = "block";
            modalImg.src = element.src;
        }

        function closeModal() {
            var modal = document.getElementById("imageModal");
            modal.style.display = "none";
        }

        function prevImage(arrow) {
            const section = arrow.closest('.image-container');
            const images = section.querySelectorAll('img');
            let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            images[currentIndex].classList.add('active');
        }

        function nextImage(arrow) {
            const section = arrow.closest('.image-container');
            const images = section.querySelectorAll('img');
            let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }

        function prevModalImage() {
            const modalImg = document.getElementById("modalImg");
            const images = Array.from(document.querySelectorAll('.image-container img'));
            const currentIndex = images.findIndex(img => img.src === modalImg.src);
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            modalImg.src = images[prevIndex].src;
        }

        function nextModalImage() {
            const modalImg = document.getElementById("modalImg");
            const images = Array.from(document.querySelectorAll('.image-container img'));
            const currentIndex = images.findIndex(img => img.src === modalImg.src);
            const nextIndex = (currentIndex + 1) % images.length;
            modalImg.src = images[nextIndex].src;
        }
    </script>
</body>

</html>
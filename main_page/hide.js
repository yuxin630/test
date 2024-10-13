document.getElementById("hide").addEventListener("click", function () {
    const button = this;
    const isHidden = button.classList.contains("hidden");

    d3.selectAll(".circle-group").each(function () {
        const circleGroup = d3.select(this);

        if (isHidden) {
            // 恢復原狀：顯示外圈並縮小內圈
            // Hide or show icons and text
            circleGroup.selectAll(".left, .right, circle.small-circle, text.icon-text").style("display", null);
            circleGroup.select("circle")
                .transition()
                .duration(500)
                .attr("r", 35);  // 縮小回到原本大小
        } else {
            // 隱藏外圈並放大內圈
            circleGroup.selectAll(".left, .right, circle.small-circle, text.icon-text").style("display", "none");
            circleGroup.select("circle")
                .transition()
                .duration(500)
                .attr("r", 50);  // 放大inner circle
        }
    });

    // 更新按鈕狀態
    if (isHidden) {
        button.classList.remove("hidden");
        button.style.backgroundColor = "";  // 恢復原本的背景色
        button.textContent = "隱藏外圈";
    } else {
        button.classList.add("hidden");
        button.style.backgroundColor = "#FFD700";  // 改變按鈕背景色
        button.textContent = "顯示外圈";
    }
});

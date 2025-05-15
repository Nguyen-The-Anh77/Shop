const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/**
 * Hàm tải template
 *
 * Cách dùng:
 * <div id="parent"></div>
 * <script>
 *  load("#parent", "./path-to-template.html");
 * </script>
 */
function load(selector, path) {
    const cached = localStorage.getItem(path);
    if (cached) {
        $(selector).innerHTML = cached;
    }

    fetch(path)
        .then((res) => res.text())
        .then((html) => {
            if (html !== cached) {
                $(selector).innerHTML = html;
                localStorage.setItem(path, html);
            }
        })
        .finally(() => {
            window.dispatchEvent(new Event("template-loaded"));
        });
}

/**
 * Hàm kiểm tra một phần tử
 * có bị ẩn bởi display: none không
 */
function isHidden(element) {
    if (!element) return true;

    if (window.getComputedStyle(element).display === "none") {
        return true;
    }

    let parent = element.parentElement;
    while (parent) {
        if (window.getComputedStyle(parent).display === "none") {
            return true;
        }
        parent = parent.parentElement;
    }

    return false;
}

/**
 * Hàm buộc một hành động phải đợi
 * sau một khoảng thời gian mới được thực thi
 */
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

/**
 * Hàm tính toán vị trí arrow cho dropdown
 *
 * Cách dùng:
 * 1. Thêm class "js-dropdown-list" vào thẻ ul cấp 1
 * 2. CSS "left" cho arrow qua biến "--arrow-left-pos"
 */
const calArrowPos = debounce(() => {
    if (isHidden($(".js-dropdown-list"))) return;

    const items = $$(".js-dropdown-list > li");

    items.forEach((item) => {
        const arrowPos = item.offsetLeft + item.offsetWidth / 2;
        item.style.setProperty("--arrow-left-pos", `${arrowPos}px`);
    });
});

// Tính toán lại vị trí arrow khi resize trình duyệt
window.addEventListener("resize", calArrowPos);

// Tính toán lại vị trí arrow sau khi tải template
window.addEventListener("template-loaded", calArrowPos);
/**
 * JS toggle
 *
 * Cách dùng:
 * <button class="js-toggle" toggle-target="#box">Click</button>
 * <div id="box">Content show/hide</div>
 */
window.addEventListener("template-loaded", initJsToggle);

function initJsToggle() {
    $$(".js-toggle").forEach((button) => {
        const target = button.getAttribute("toggle-target");
        if (!target) {
            document.body.innerText = `Cần thêm toggle-target cho: ${button.outerHTML}`;
        }
        button.onclick = (e) => {
            e.preventDefault();
            if (!$(target)) {
                return (document.body.innerText = `Không tìm thấy phần tử "${target}"`);
            }
            const isHidden = $(target).classList.contains("hide");

            requestAnimationFrame(() => {
                $(target).classList.toggle("hide", !isHidden);
                $(target).classList.toggle("show", isHidden);
            });
        };
        document.onclick = function (e) {
            if (!e.target.closest(target)) {
                const isHidden = $(target).classList.contains("hide");
                if (!isHidden) {
                    button.click();
                }
            }
        };
    });
}
window.addEventListener("template-loaded", () => {
    const links = $$(".js-dropdown-list > li > a");

    links.forEach((link) => {
        link.onclick = () => {
            if (window.innerWidth > 991) return;
            const item = link.closest("li");
            item.classList.toggle("navbar__item--active");
        };
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);

    let currentIndex = 0; // Đầu tiên, slide hiện tại là slide đầu tiên
    const slides = document.querySelectorAll(".slideshow__item");
    const totalSlides = slides.length;
    let autoSlideInterval; // Biến lưu trữ interval tự động

    // Hàm chuyển slide
    function changeSlide(direction) {
        // Cập nhật chỉ số slide hiện tại
        currentIndex += direction;

        // Nếu currentIndex vượt qua số lượng slide, quay lại slide đầu tiên
        if (currentIndex >= totalSlides) {
            currentIndex = 0;
        }
        // Nếu currentIndex nhỏ hơn 0, chuyển về slide cuối cùng
        if (currentIndex < 0) {
            currentIndex = totalSlides - 1;
        }

        // Cập nhật vị trí của slideshow__inner để chuyển đến slide mới
        const slideshowInner = document.querySelector(".slideshow__inner");
        slideshowInner.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Optional: Thêm hiệu ứng active (mờ các slide không phải hiện tại)
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.classList.add("active");
            } else {
                slide.classList.remove("active");
            }
        });
    }

    // Optional: Tự động chuyển slide mỗi 5 giây
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            changeSlide(1); // Tự động chuyển sang slide tiếp theo
        }, 5000);
    }

    // Dừng tự động chuyển slide khi người dùng tương tác
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Khởi tạo auto slide
    startAutoSlide();

    // Khi người dùng bấm nút điều hướng (prev hoặc next)
    document.querySelector(".prev").addEventListener("click", () => {
        changeSlide(-1);
        stopAutoSlide(); // Dừng auto slide khi người dùng bấm nút
        startAutoSlide(); // Khởi động lại auto slide sau khi bấm
    });

    document.querySelector(".next").addEventListener("click", () => {
        changeSlide(1);
        stopAutoSlide(); // Dừng auto slide khi người dùng bấm nút
        startAutoSlide(); // Khởi động lại auto slide sau khi bấm
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const slider = document.getElementById("slider");
    const minPriceInput = document.getElementById("min-price");
    const maxPriceInput = document.getElementById("max-price");

    // Cập nhật giá trị trường nhập liệu khi thanh trượt thay đổi
    slider.addEventListener("input", function () {
        const minValue = slider.value;
        const maxValue = slider.max;

        minPriceInput.value = `${formatCurrency(minValue)}đ`;
        maxPriceInput.value = `${formatCurrency(maxValue)}đ`;
    });

    // Hàm định dạng giá trị tiền tệ
    function formatCurrency(value) {
        return parseInt(value).toLocaleString();
    }

    // Cập nhật giá trị ban đầu khi trang tải xong
    const initialMinValue = slider.value;
    minPriceInput.value = `${formatCurrency(initialMinValue)}đ`;
    maxPriceInput.value = `${formatCurrency(slider.max)}đ`;
});
// chon kich thuoc

document.addEventListener("DOMContentLoaded", function () {
    const sizeOptions = document.querySelectorAll(".filter__form-size-option");

    sizeOptions.forEach((option) => {
        option.addEventListener("click", () => {
            // Xóa bỏ lớp selected ở tất cả các button
            sizeOptions.forEach((opt) => opt.classList.remove("selected"));

            // Thêm lớp selected cho button được chọn
            option.classList.add("selected");

            // Có thể lấy giá trị size đã chọn để sử dụng sau này
            const selectedSize = option.getAttribute("data-size");
            console.log("Kích thước giày đã chọn: " + selectedSize);
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const sizeOptions = document.querySelectorAll(".filter__form-size-clothes");

    sizeOptions.forEach((option) => {
        option.addEventListener("click", () => {
            // Xóa bỏ lớp selected ở tất cả các button
            sizeOptions.forEach((opt) => opt.classList.remove("selected"));

            // Thêm lớp selected cho button được chọn
            option.classList.add("selected");

            // Có thể lấy giá trị size đã chọn để sử dụng sau này
            const selectedSize = option.getAttribute("data-size");
            console.log("Kích thước giày đã chọn: " + selectedSize);
        });
    });
});

function transformHeart(button) {
    var heartIcon = button.querySelector(".like-btn__icon"); // Lấy phần tử img
    console.log(heartIcon.src); // In ra đường dẫn hình ảnh hiện tại

    if (heartIcon.src.includes("heart.svg")) {
        heartIcon.src = "../assets/icons/hearter.svg"; // Thay đổi thành trái tim đầy
    } else {
        heartIcon.src = "../assets/icons/heart.svg"; // Quay lại trái tim rỗng
    }
}

// thanh toan
document.addEventListener("DOMContentLoaded", function () {
    let selectedSize = null; // Biến lưu kích thước đã chọn

    // Xử lý việc chọn kích thước giày
    const sizeOptions = document.querySelectorAll(".prod__form-size-option");
    sizeOptions.forEach((option) => {
        option.addEventListener("click", function () {
            // Xóa lớp 'selected' khỏi tất cả các kích thước
            sizeOptions.forEach((opt) => opt.classList.remove("selected"));

            // Thêm lớp 'selected' vào kích thước được chọn
            this.classList.add("selected");

            // Lưu lại kích thước đã chọn
            selectedSize = this.getAttribute("data-size");

            // Cập nhật thông tin kích thước giày hiển thị trên giao diện
            document.getElementById(
                "selectedSizeLabel"
            ).innerText = `  ${selectedSize}`;
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".product-preview__item");
    const thumbs = document.querySelectorAll(".product-preview__thumb-img");

    // Hàm thay đổi ảnh chính khi nhấn nút trước/sau
    function changeSlide(direction) {
        currentSlide += direction;

        if (currentSlide < 0) currentSlide = slides.length - 1;
        if (currentSlide >= slides.length) currentSlide = 0;

        updateSlide();
    }

    // Cập nhật ảnh chính
    function updateSlide() {
        const slideWidth = slides[0].clientWidth;
        const offset = -currentSlide * slideWidth;

        // Thêm hiệu ứng trượt cho ảnh chính
        document.querySelector(
            ".product-preview__list"
        ).style.transform = `translateX(${offset}px)`;

        // Cập nhật ảnh thu nhỏ
        thumbs.forEach((thumb, index) => {
            thumb.classList.remove("active");
            if (index === currentSlide) {
                thumb.classList.add("active"); // Hiển thị ảnh thu nhỏ đã chọn
            }
        });
    }

    // Đặt ảnh đầu tiên là ảnh đang hiển thị
    updateSlide();

    // Hàm thay đổi ảnh chính khi nhấn vào ảnh thu nhỏ
    function setMainImage(index) {
        currentSlide = index;
        updateSlide();
    }

    // Gắn sự kiện click cho các ảnh thu nhỏ
    thumbs.forEach((thumb, index) => {
        thumb.addEventListener("click", function () {
            setMainImage(index); // Đặt ảnh chính khi nhấn vào ảnh thu nhỏ
        });
    });

    // Gắn sự kiện cho các nút điều hướng (prev và next)
    const prevButton = document.querySelector(".product-preview__prev");
    const nextButton = document.querySelector(".product-preview__next");

    if (prevButton && nextButton) {
        prevButton.addEventListener("click", function () {
            changeSlide(-1); // Chuyển ảnh chính qua trái
        });

        nextButton.addEventListener("click", function () {
            changeSlide(1); // Chuyển ảnh chính qua phải
        });
    }
});

window.addEventListener("template-loaded", () => {
    const tabsSelector = "prod-tab__item";
    const contentsSelector = "prod-tab__content";

    const tabActive = `${tabsSelector}--current`;
    const contentActive = `${contentsSelector}--current`;

    const tabContainers = $$(".js-tabs");
    tabContainers.forEach((tabContainer) => {
        const tabs = tabContainer.querySelectorAll(`.${tabsSelector}`);
        const contents = tabContainer.querySelectorAll(`.${contentsSelector}`);
        tabs.forEach((tab, index) => {
            tab.onclick = () => {
                tabContainer
                    .querySelector(`.${tabActive}`)
                    ?.classList.remove(tabActive);
                tabContainer
                    .querySelector(`.${contentActive}`)
                    ?.classList.remove(contentActive);
                tab.classList.add(tabActive);
                contents[index].classList.add(contentActive);
            };
        });
    });
});
// document.addEventListener("DOMContentLoaded", function () {
//     let currentSlide = 0;
//     const slides = document.querySelectorAll(".product-preview__item");
//     const thumbs = document.querySelectorAll(".product-preview__thumb-img");

//     // Hàm thay đổi ảnh chính khi nhấn nút trước/sau
//     function changeSlide(direction) {
//         currentSlide += direction;

//         if (currentSlide < 0) currentSlide = slides.length - 1;
//         if (currentSlide >= slides.length) currentSlide = 0;

//         updateSlide();
//     }

//     // Cập nhật ảnh chính
//     function updateSlide() {
//         const slideWidth = slides[0].clientWidth;
//         const offset = -currentSlide * slideWidth;

//         // Thêm hiệu ứng trượt cho ảnh chính
//         document.querySelector(
//             ".product-preview__list"
//         ).style.transform = `translateX(${offset}px)`;

//         // Cập nhật ảnh thu nhỏ
//         thumbs.forEach((thumb, index) => {
//             thumb.classList.remove("active");
//             if (index === currentSlide) {
//                 thumb.classList.add("active"); // Hiển thị ảnh thu nhỏ đã chọn
//             }
//         });
//     }

//     // Đặt ảnh đầu tiên là ảnh đang hiển thị
//     updateSlide();

//     // Hàm thay đổi ảnh chính khi nhấn vào ảnh thu nhỏ
//     function setMainImage(index) {
//         currentSlide = index;
//         updateSlide();
//     }

//     // Gắn sự kiện click cho các ảnh thu nhỏ
//     thumbs.forEach((thumb, index) => {
//         thumb.addEventListener("click", function () {
//             setMainImage(index); // Đặt ảnh chính khi nhấn vào ảnh thu nhỏ
//         });
//     });

//     // Gắn sự kiện cho các nút điều hướng (prev và next)
//     const prevButton = document.querySelector(".product-preview__prev");
//     const nextButton = document.querySelector(".product-preview__next");

//     if (prevButton && nextButton) {
//         prevButton.addEventListener("click", function () {
//             changeSlide(-1); // Chuyển ảnh chính qua trái
//         });

//         nextButton.addEventListener("click", function () {
//             changeSlide(1); // Chuyển ảnh chính qua phải
//         });
//     }
// });
// document.addEventListener("DOMContentLoaded", function () {
//     let currentSlide = 0;
//     const slides = document.querySelectorAll(".product-preview__item");
//     const thumbs = document.querySelectorAll(".product-preview__thumb-img");

//     // Hàm thay đổi ảnh chính khi nhấn nút trước/sau
//     function changeSlide(direction) {
//         currentSlide += direction;

//         if (currentSlide < 0) currentSlide = slides.length - 1;
//         if (currentSlide >= slides.length) currentSlide = 0;

//         updateSlide();
//     }

//     // Cập nhật ảnh chính
//     function updateSlide() {
//         const slideWidth = slides[0].clientWidth;
//         const offset = -currentSlide * slideWidth;

//         // Thêm hiệu ứng trượt cho ảnh chính
//         document.querySelector(
//             ".product-preview__list"
//         ).style.transform = `translateX(${offset}px)`;

//         // Cập nhật ảnh thu nhỏ
//         thumbs.forEach((thumb, index) => {
//             thumb.classList.remove("active");
//             if (index === currentSlide) {
//                 thumb.classList.add("active"); // Hiển thị ảnh thu nhỏ đã chọn
//             }
//         });
//     }

//     // Đặt ảnh đầu tiên là ảnh đang hiển thị
//     updateSlide();

//     // Hàm thay đổi ảnh chính khi nhấn vào ảnh thu nhỏ
//     function setMainImage(index) {
//         currentSlide = index;
//         updateSlide();
//     }

//     // Gắn sự kiện click cho các ảnh thu nhỏ
//     thumbs.forEach((thumb, index) => {
//         thumb.addEventListener("click", function () {
//             setMainImage(index); // Đặt ảnh chính khi nhấn vào ảnh thu nhỏ
//         });
//     });

//     // Gắn sự kiện cho các nút điều hướng (prev và next)
//     const prevButton = document.querySelector(".product-preview__prev");
//     const nextButton = document.querySelector(".product-preview__next");

//     if (prevButton && nextButton) {
//         prevButton.addEventListener("click", function () {
//             changeSlide(-1); // Chuyển ảnh chính qua trái
//         });

//         nextButton.addEventListener("click", function () {
//             changeSlide(1); // Chuyển ảnh chính qua phải
//         });
//     }
// });
document.addEventListener("DOMContentLoaded", function () {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".product-preview__item");
    const thumbs = document.querySelectorAll(".product-preview__thumb-img");

    // Hàm thay đổi ảnh chính khi nhấn nút trước/sau
    function changeSlide(direction) {
        currentSlide += direction;

        if (currentSlide < 0) currentSlide = slides.length - 1;
        if (currentSlide >= slides.length) currentSlide = 0;

        updateSlide();
    }

    // Cập nhật ảnh chính
    function updateSlide() {
        const slideWidth = slides[0].clientWidth; // Lấy chiều rộng của ảnh chính

        // Chuyển ảnh chính
        document.querySelector(
            ".product-preview__list"
        ).style.transform = `translateX(-${currentSlide * slideWidth}px)`;

        // Cập nhật ảnh thu nhỏ
        thumbs.forEach((thumb, index) => {
            thumb.classList.remove("active");
            if (index === currentSlide) {
                thumb.classList.add("active"); // Đánh dấu ảnh thu nhỏ được chọn
            }
        });
    }

    // Đặt ảnh đầu tiên là ảnh đang hiển thị
    updateSlide();

    // Hàm thay đổi ảnh chính khi nhấn vào ảnh thu nhỏ
    function setMainImage(index) {
        currentSlide = index;
        updateSlide();
    }

    // Gắn sự kiện click cho các ảnh thu nhỏ
    thumbs.forEach((thumb, index) => {
        thumb.addEventListener("click", function () {
            setMainImage(index); // Đặt ảnh chính khi nhấn vào ảnh thu nhỏ
        });
    });

    // Quản lý nút chuyển tiếp cho ảnh thu nhỏ
    let currentThumb = 0;
    const maxThumbs = thumbs.length;

    function changeThumbSlide(direction) {
        currentThumb += direction;

        if (currentThumb < 0) currentThumb = 0; // Giới hạn tối thiểu
        if (currentThumb >= maxThumbs - 3) currentThumb = maxThumbs - 3; // Giới hạn tối đa để không tràn ra ngoài

        updateThumbs();
    }

    // Cập nhật cuộn các ảnh thu nhỏ
    function updateThumbs() {
        const thumbWidth = thumbs[0].offsetWidth + 10; // Kích thước của từng hình thu nhỏ cộng thêm khoảng cách margin
        const thumbContainer = document.querySelector(
            ".product-preview__thumbs"
        );
        thumbContainer.style.transform = `translateX(-${
            currentThumb * thumbWidth
        }px)`; // Di chuyển ảnh thu nhỏ
    }

    // Gắn sự kiện cho các nút điều hướng (prev và next)
    const prevButton = document.querySelector(".product-preview__prev");
    const nextButton = document.querySelector(".product-preview__next");
    const thumbPrevButton = document.querySelector(".thumbs-prev");
    const thumbNextButton = document.querySelector(".thumbs-next");

    if (prevButton && nextButton) {
        prevButton.addEventListener("click", function () {
            changeSlide(-1); // Chuyển ảnh chính qua trái
        });

        nextButton.addEventListener("click", function () {
            changeSlide(1); // Chuyển ảnh chính qua phải
        });
    }

    if (thumbPrevButton && thumbNextButton) {
        thumbPrevButton.addEventListener("click", function () {
            changeThumbSlide(-1); // Chuyển ảnh thu nhỏ qua trái
        });

        thumbNextButton.addEventListener("click", function () {
            changeThumbSlide(1); // Chuyển ảnh thu nhỏ qua phải
        });
    }
});
window.addEventListener("template-loaded", () => {
    const switchBtn = document.querySelector("#switch-theme-btn");
    if (switchBtn) {
        switchBtn.onclick = function () {
            const isDark = localStorage.dark === "true";
            document.querySelector("html").classList.toggle("dark", !isDark);
            localStorage.setItem("dark", !isDark);
            switchBtn.querySelector("span").textContent = isDark
                ? "Dark mode"
                : "Light mode";
        };
        const isDark = localStorage.dark === "true";
        switchBtn.querySelector("span").textContent = isDark
            ? "Light mode"
            : "Dark mode";
    }
});

const isDark = localStorage.dark === "true";
document.querySelector("html").classList.toggle("dark", isDark);
// l

// document.addEventListener("DOMContentLoaded", function () {
//     function scrollCarousel(direction) {
//         const carousel = document.getElementById("carousel");
//         const card = carousel.querySelector(".product-card__new");
//         const scrollAmount = card.offsetWidth + 16; // 16 = khoảng cách gap

//         carousel.scrollBy({
//             left: direction * scrollAmount,
//             behavior: "smooth",
//         });
//     }
// });
function scrollCarousel(direction) {
    const carousel = document.getElementById("carousel");
    const card = carousel.querySelector(".product-card__main");
    const scrollAmount = card.offsetWidth + 16; // 20 là khoảng cách gap
    carousel.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Danh sách ID của tất cả carousel bạn muốn điều khiển
    const carouselIds = ["carousel", "carousel_man", "carousel-woman"];

    carouselIds.forEach((id) => {
        const carousel = document.getElementById(id);
        if (!carousel) return;

        const prevBtn = carousel.querySelector(
            ".product__nav.product__disabled"
        );
        const nextBtn = carousel.querySelector(".product__nav.product__next");

        // 1. Scroll một card mỗi lần click
        function scrollOneCard(direction) {
            const card = carousel.querySelector(".product-card__main");
            const gap = parseInt(getComputedStyle(carousel).gap) || 16;
            const amount = card.offsetWidth + gap;
            carousel.scrollBy({ left: direction * amount, behavior: "smooth" });
        }

        prevBtn.addEventListener("click", () => scrollOneCard(-1));
        nextBtn.addEventListener("click", () => scrollOneCard(1));

        // 2. Ẩn/hiện nút prev/next khi scroll hoặc resize
        function updateButtons() {
            prevBtn.style.display = carousel.scrollLeft > 0 ? "block" : "none";
            nextBtn.style.display =
                carousel.scrollLeft + carousel.clientWidth <
                carousel.scrollWidth - 1
                    ? "block"
                    : "none";
        }

        carousel.addEventListener("scroll", updateButtons);
        window.addEventListener("resize", updateButtons);

        // 3. Khởi tạo trạng thái nút ngay khi load
        updateButtons();
    });
});
window.addEventListener("template-loaded", () => {
    const tabsSelector = "product-tab__item";
    const contentsSelector = "product-tab__content";

    const tabActive = `${tabsSelector}--current`;
    const contentActive = `${contentsSelector}--current`;

    const tabContainers = $$(".js-tabs");
    tabContainers.forEach((tabContainer) => {
        const tabs = tabContainer.querySelectorAll(`.${tabsSelector}`);
        const contents = tabContainer.querySelectorAll(`.${contentsSelector}`);
        tabs.forEach((tab, index) => {
            tab.onclick = () => {
                tabContainer
                    .querySelector(`.${tabActive}`)
                    ?.classList.remove(tabActive);
                tabContainer
                    .querySelector(`.${contentActive}`)
                    ?.classList.remove(contentActive);
                tab.classList.add(tabActive);
                contents[index].classList.add(contentActive);
            };
        });
    });
});

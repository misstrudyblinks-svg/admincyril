// ==========================================
// BIZMANAGER DASHBOARD
// ==========================================


// ==========================================
// DASHBOARD AUTHENTICATION
// ==========================================

const isLoggedIn =
    localStorage.getItem("adminLoggedIn");


// Protect dashboard

if (isLoggedIn !== "true") {

    window.location.href = "login.html";

}


// ==========================================
// MOBILE SIDEBAR
// ==========================================

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");


if (menuToggle && sidebar) {

    menuToggle.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle("open");

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (confirmLogout) {

                localStorage.removeItem(
                    "adminLoggedIn"
                );

                localStorage.removeItem(
                    "adminEmail"
                );

                window.location.href =
                    "login.html";

            }

        }
    );

}


// ==========================================
// ADMIN EMAIL
// ==========================================

const adminEmail =
    localStorage.getItem("adminEmail");

console.log(
    "Logged in admin:",
    adminEmail
);


// ==========================================
// LOAD DATA
// ==========================================

function getOrders() {

    return JSON.parse(
        localStorage.getItem("orders")
    ) || [];

}


function getProducts() {

    return JSON.parse(
        localStorage.getItem("products")
    ) || [];

}


function getCustomers() {

    return JSON.parse(
        localStorage.getItem("customers")
    ) || [];

}


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {

    return `GH₵ ${Number(amount || 0).toLocaleString(
        "en-GH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

}


// ==========================================
// GET PRODUCT STOCK
// ==========================================

function getProductStock(product) {

    return Number(
        product.stock ??
        product.quantity ??
        0
    );

}


// ==========================================
// GET PRODUCT NAME
// ==========================================

function getProductName(product) {

    return (
        product.name ||
        product.productName ||
        "Unnamed Product"
    );

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateDashboardStats() {

    const orders =
        getOrders();

    const products =
        getProducts();

    const customers =
        getCustomers();


    // --------------------------------------
    // TOTAL SALES
    // --------------------------------------

    const totalSales =
        orders
            .filter(
                order =>
                    order.status !==
                    "Cancelled"
            )
            .reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    Number(
                        order.total
                    ),
                0
            );


    // --------------------------------------
    // TOTAL REVENUE
    // --------------------------------------

    // Revenue comes from completed orders.

    const totalRevenue =
        orders
            .filter(
                order =>
                    order.status ===
                    "Completed"
            )
            .reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    Number(
                        order.total
                    ),
                0
            );


    // --------------------------------------
    // CUSTOMERS
    // --------------------------------------

    let customerCount =
        customers.length;


    // If no customers LocalStorage exists,
    // calculate unique customers from orders.

    if (customerCount === 0) {

        const uniqueCustomers =
            new Set();

        orders.forEach(
            order => {

                if (
                    order.customer &&
                    order.customer.phone
                ) {

                    uniqueCustomers.add(
                        order.customer.phone
                    );

                }
                else if (
                    order.customer &&
                    order.customer.email
                ) {

                    uniqueCustomers.add(
                        order.customer.email
                    );

                }

            }
        );


        customerCount =
            uniqueCustomers.size;

    }


    // --------------------------------------
    // PRODUCTS
    // --------------------------------------

    const productCount =
        products.length;


    // --------------------------------------
    // DISPLAY
    // --------------------------------------

    const totalSalesElement =
        document.getElementById(
            "totalSales"
        );

    const totalRevenueElement =
        document.getElementById(
            "totalRevenue"
        );

    const totalCustomersElement =
        document.getElementById(
            "totalCustomers"
        );

    const totalProductsElement =
        document.getElementById(
            "totalProducts"
        );


    if (totalSalesElement) {

        totalSalesElement.textContent =
            formatMoney(totalSales);

    }


    if (totalRevenueElement) {

        totalRevenueElement.textContent =
            formatMoney(totalRevenue);

    }


    if (totalCustomersElement) {

        totalCustomersElement.textContent =
            customerCount;

    }


    if (totalProductsElement) {

        totalProductsElement.textContent =
            productCount;

    }

}


// ==========================================
// RECENT SALES
// ==========================================

function updateRecentSales() {

    const orders =
        getOrders();


    // Find the table body in dashboard

    const tableBody =
        document.getElementById(
            "recentSalesBody"
        );


    if (!tableBody) {

        console.warn(
            "recentSalesBody was not found in dashboard.html"
        );

        return;

    }


    tableBody.innerHTML = "";


    if (orders.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="4"
                    style="text-align:center;padding:25px;">

                    No sales yet.

                </td>

            </tr>

        `;

        return;

    }


    // Latest orders first

    const recentOrders =
        orders
            .slice()
            .sort(
                (
                    a,
                    b
                ) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(
                0,
                5
            );


    recentOrders.forEach(
        order => {

            const customer =
                order.customer ||
                {};


            const customerName =
                customer.name ||
                "Unknown Customer";


            const initials =
                customerName
                    .split(" ")
                    .map(
                        name =>
                            name
                                .charAt(0)
                                .toUpperCase()
                    )
                    .slice(0, 2)
                    .join("");


            const firstProduct =
                order.items &&
                order.items.length > 0
                    ? order.items[0].name
                    : "Order";


            const row =
                document.createElement(
                    "tr"
                );


            const status =
                order.status ||
                "Pending";


            const statusClass =
                status
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );


            row.innerHTML = `

                <td>

                    <div class="customer-cell">

                        <div class="customer-avatar">

                            ${initials || "CU"}

                        </div>

                        <span>

                            ${customerName}

                        </span>

                    </div>

                </td>


                <td>

                    ${firstProduct}

                    ${
                        order.items &&
                        order.items.length > 1
                            ? ` + ${
                                order.items.length - 1
                            } more`
                            : ""
                    }

                </td>


                <td>

                    ${formatMoney(order.total)}

                </td>


                <td>

                    <span class="status ${statusClass}">

                        ${status}

                    </span>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// LOW STOCK
// ==========================================

function updateLowStock() {

    const products =
        getProducts();


    const lowStockContainer =
        document.getElementById(
            "lowStockList"
        );


    if (!lowStockContainer) {

        console.warn(
            "lowStockList was not found in dashboard.html"
        );

        return;

    }


    lowStockContainer.innerHTML = "";


    // Products with 0 or less are also included

    const lowStockProducts =
        products.filter(
            product =>
                getProductStock(product) <= 5
        );


    // --------------------------------------
    // NO LOW STOCK
    // --------------------------------------

    if (
        lowStockProducts.length === 0
    ) {

        lowStockContainer.innerHTML = `

            <div class="stock-item">

                <div class="product-icon">

                    <i class="fa-solid fa-circle-check"></i>

                </div>

                <div class="stock-info">

                    <strong>
                        Stock looks good
                    </strong>

                    <span>
                        No products need attention
                    </span>

                </div>

                <span class="stock-number">
                    0
                </span>

            </div>

        `;

        return;

    }


    // --------------------------------------
    // DISPLAY LOW STOCK
    // --------------------------------------

    lowStockProducts
        .sort(
            (
                a,
                b
            ) =>
                getProductStock(a) -
                getProductStock(b)
        )
        .slice(
            0,
            5
        )
        .forEach(
            product => {

                const stock =
                    getProductStock(
                        product
                    );


                const stockClass =
                    stock <= 2
                        ? "danger"
                        : "warning";


                const icon =
                    product.category &&
                    product.category
                        .toLowerCase()
                        .includes(
                            "phone"
                        )
                        ? "fa-mobile-screen"
                        : "fa-box";


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "stock-item";


                item.innerHTML = `

                    <div class="product-icon">

                        <i class="fa-solid ${icon}"></i>

                    </div>


                    <div class="stock-info">

                        <strong>

                            ${getProductName(product)}

                        </strong>

                        <span>

                            ${product.category || "Product"}

                        </span>

                    </div>


                    <span class="stock-number ${stockClass}">

                        ${
                            stock <= 0
                                ? "Out of stock"
                                : `${stock} left`
                        }

                    </span>

                `;


                lowStockContainer.appendChild(
                    item
                );

            }
        );

}


// ==========================================
// REFRESH DASHBOARD
// ==========================================

function refreshDashboard() {

    updateDashboardStats();

    updateRecentSales();

    updateLowStock();

}


// ==========================================
// LISTEN FOR STORAGE CHANGES
// ==========================================

window.addEventListener(
    "storage",
    function(event) {

        if (
            event.key === "orders" ||
            event.key === "products" ||
            event.key === "customers"
        ) {

            refreshDashboard();

        }

    }
);


// ==========================================
// REFRESH WHEN PAGE BECOMES VISIBLE
// ==========================================

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.visibilityState ===
            "visible"
        ) {

            refreshDashboard();

        }

    }
);


// ==========================================
// INITIAL LOAD
// ==========================================

refreshDashboard();


// ==========================================
// AUTO REFRESH
// ==========================================

setInterval(
    refreshDashboard,
    2000
);
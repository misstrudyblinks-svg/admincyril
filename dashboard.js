// ==========================================
// BIZMANAGER DASHBOARD
// FIREBASE FIRESTORE VERSION
// REAL-TIME DASHBOARD
// ==========================================


// ==========================================
// FIREBASE IMPORTS
// ==========================================

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";


// ==========================================
// DASHBOARD AUTHENTICATION
// ==========================================

const isLoggedIn =
    localStorage.getItem("adminLoggedIn");

if (isLoggedIn !== "true") {

    window.location.href =
        "login.html";

}


// ==========================================
// FIREBASE COLLECTIONS
// ==========================================

const ordersCollection =
    collection(
        db,
        "orders"
    );

const productsCollection =
    collection(
        db,
        "products"
    );


// ==========================================
// DATA
// ==========================================

let orders = [];

let products = [];


// ==========================================
// MOBILE SIDEBAR
// ==========================================

const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );


if (
    menuToggle &&
    sidebar
) {

    menuToggle.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


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
    localStorage.getItem(
        "adminEmail"
    );


console.log(
    "Logged in admin:",
    adminEmail
);


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {

    return `GH₵ ${Number(
        amount || 0
    ).toLocaleString(
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
// GET PRODUCT LOW STOCK LEVEL
// ==========================================

function getProductLowStockLevel(product) {

    return Number(
        product.lowStock ??
        5
    );

}


// ==========================================
// GET ORDER DATE
// ==========================================

function getOrderDate(order) {

    // Your checkout saves date as an ISO string.
    if (order.date) {

        const date =
            new Date(
                order.date
            );

        if (!isNaN(date.getTime())) {

            return date;

        }

    }


    // Fallback for Firestore Timestamp
    if (
        order.createdAt &&
        typeof order.createdAt.toDate === "function"
    ) {

        return order.createdAt.toDate();

    }


    return new Date(0);

}


// ==========================================
// UPDATE DASHBOARD STATISTICS
// ==========================================

function updateDashboardStats() {


    // ======================================
    // TOTAL SALES
    // ======================================

    const totalSales =
        orders
            .filter(
                order =>
                    String(
                        order.status || ""
                    ).toLowerCase() !==
                    "cancelled"
            )
            .reduce(
                (
                    total,
                    order
                ) => {

                    return (
                        total +
                        Number(
                            order.total || 0
                        )
                    );

                },
                0
            );


    // ======================================
    // TOTAL REVENUE
    // ======================================

    const totalRevenue =
        orders
            .filter(
                order =>
                    String(
                        order.status || ""
                    ).toLowerCase() ===
                    "completed"
            )
            .reduce(
                (
                    total,
                    order
                ) => {

                    return (
                        total +
                        Number(
                            order.total || 0
                        )
                    );

                },
                0
            );


    // ======================================
    // CUSTOMERS
    // ======================================

    const uniqueCustomers =
        new Set();


    orders.forEach(
        order => {

            const customer =
                order.customer ||
                {};


            if (
                customer.phone
            ) {

                uniqueCustomers.add(
                    String(
                        customer.phone
                    ).trim()
                );

            }

            else if (
                customer.email
            ) {

                uniqueCustomers.add(
                    String(
                        customer.email
                    ).trim()
                    .toLowerCase()
                );

            }

        }
    );


    const customerCount =
        uniqueCustomers.size;


    // ======================================
    // PRODUCTS
    // ======================================

    const productCount =
        products.length;


    // ======================================
    // LOW STOCK COUNT
    // ======================================

    const lowStockProducts =
        products.filter(
            product => {

                const stock =
                    getProductStock(
                        product
                    );

                const lowStockLevel =
                    getProductLowStockLevel(
                        product
                    );

                return (
                    stock <=
                    lowStockLevel
                );

            }
        );


    const lowStockCount =
        lowStockProducts.length;


    // ======================================
    // DISPLAY ELEMENTS
    // ======================================

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


    const lowStockSummary =
        document.getElementById(
            "lowStockSummary"
        );


    // ======================================
    // UPDATE DISPLAY
    // ======================================

    if (
        totalSalesElement
    ) {

        totalSalesElement.textContent =
            formatMoney(
                totalSales
            );

    }


    if (
        totalRevenueElement
    ) {

        totalRevenueElement.textContent =
            formatMoney(
                totalRevenue
            );

    }


    if (
        totalCustomersElement
    ) {

        totalCustomersElement.textContent =
            customerCount;

    }


    if (
        totalProductsElement
    ) {

        totalProductsElement.textContent =
            productCount;

    }


    if (
        lowStockSummary
    ) {

        if (
            lowStockCount === 0
        ) {

            lowStockSummary.textContent =
                "No low stock products";

        }

        else {

            lowStockSummary.textContent =
                `${lowStockCount} low stock product${
                    lowStockCount === 1
                        ? ""
                        : "s"
                }`;

        }

    }

}


// ==========================================
// RECENT SALES
// ==========================================

function updateRecentSales() {

    const tableBody =
        document.getElementById(
            "recentSalesBody"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    if (
        orders.length === 0
    ) {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        padding:25px;
                    "
                >

                    No sales yet.

                </td>

            </tr>

        `;

        return;

    }


    // ======================================
    // SORT NEWEST FIRST
    // ======================================

    const recentOrders =
        orders
            .slice()
            .sort(
                (
                    a,
                    b
                ) => {

                    return (
                        getOrderDate(b) -
                        getOrderDate(a)
                    );

                }
            )
            .slice(
                0,
                5
            );


    // ======================================
    // DISPLAY ORDERS
    // ======================================

    recentOrders.forEach(
        order => {

            const customer =
                order.customer ||
                {};


            const customerName =
                customer.name ||
                order.customerName ||
                "Unknown Customer";


            const initials =
                customerName
                    .split(" ")
                    .filter(
                        name =>
                            name.trim()
                    )
                    .map(
                        name =>
                            name
                                .charAt(0)
                                .toUpperCase()
                    )
                    .slice(
                        0,
                        2
                    )
                    .join("");


            const firstProduct =
                order.items &&
                order.items.length > 0

                    ? order.items[0].name ||
                      "Product"

                    : "Order";


            const row =
                document.createElement(
                    "tr"
                );


            const status =
                order.status ||
                "Pending";


            const statusClass =
                String(
                    status
                )
                .toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                );


            row.innerHTML = `

                <td>

                    <div class="customer-cell">

                        <div class="customer-avatar">

                            ${
                                escapeHTML(
                                    initials ||
                                    "CU"
                                )
                            }

                        </div>

                        <span>

                            ${escapeHTML(
                                customerName
                            )}

                        </span>

                    </div>

                </td>


                <td>

                    ${escapeHTML(
                        firstProduct
                    )}

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

                    ${formatMoney(
                        order.total
                    )}

                </td>


                <td>

                    <span
                        class="status ${escapeHTML(
                            statusClass
                        )}"
                    >

                        ${escapeHTML(
                            status
                        )}

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

    const lowStockContainer =
        document.getElementById(
            "lowStockList"
        );


    if (!lowStockContainer) {

        return;

    }


    lowStockContainer.innerHTML = "";


    // ======================================
    // FIND LOW STOCK PRODUCTS
    // ======================================

    const lowStockProducts =
        products.filter(
            product => {

                const stock =
                    getProductStock(
                        product
                    );

                const lowStockLevel =
                    getProductLowStockLevel(
                        product
                    );

                return (
                    stock <=
                    lowStockLevel
                );

            }
        );


    // ======================================
    // NO LOW STOCK
    // ======================================

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


    // ======================================
    // SORT LOWEST STOCK FIRST
    // ======================================

    lowStockProducts
        .slice()
        .sort(
            (
                a,
                b
            ) => {

                return (
                    getProductStock(a) -
                    getProductStock(b)
                );

            }
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
                    String(
                        product.category
                    )
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

                        <i
                            class="
                                fa-solid
                                ${icon}
                            "
                        ></i>

                    </div>


                    <div class="stock-info">

                        <strong>

                            ${escapeHTML(
                                getProductName(
                                    product
                                )
                            )}

                        </strong>


                        <span>

                            ${
                                escapeHTML(
                                    product.category ||
                                    "Product"
                                )
                            }

                        </span>

                    </div>


                    <span
                        class="
                            stock-number
                            ${stockClass}
                        "
                    >

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
// FIREBASE ORDERS REAL-TIME LISTENER
// ==========================================

function loadOrdersFromFirebase() {

    console.log(
        "Starting Firebase orders listener..."
    );


    onSnapshot(

        ordersCollection,

        snapshot => {

            orders =
                snapshot.docs.map(
                    documentSnapshot => ({

                        id:
                            documentSnapshot.id,

                        ...documentSnapshot.data()

                    })
                );


            console.log(
                "Dashboard orders updated:",
                orders
            );


            refreshDashboard();

        },

        error => {

            console.error(
                "Firebase orders listener error:",
                error
            );

        }

    );

}


// ==========================================
// FIREBASE PRODUCTS REAL-TIME LISTENER
// ==========================================

function loadProductsFromFirebase() {

    console.log(
        "Starting Firebase products listener..."
    );


    onSnapshot(

        productsCollection,

        snapshot => {

            products =
                snapshot.docs.map(
                    documentSnapshot => ({

                        id:
                            documentSnapshot.id,

                        ...documentSnapshot.data()

                    })
                );


            console.log(
                "Dashboard products updated:",
                products
            );


            refreshDashboard();

        },

        error => {

            console.error(
                "Firebase products listener error:",
                error
            );

        }

    );

}


// ==========================================
// QUICK ACTIONS
// ==========================================


// ADD CUSTOMER

const addCustomerBtn =
    document.getElementById(
        "addCustomerBtn"
    );


if (addCustomerBtn) {

    addCustomerBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "customers.html";

        }
    );

}


// ADD PRODUCT

const addProductBtn =
    document.getElementById(
        "addProductBtn"
    );


if (addProductBtn) {

    addProductBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "products.html";

        }
    );

}


// NEW SALE

const newSaleBtn =
    document.getElementById(
        "newSaleBtn"
    );


if (newSaleBtn) {

    newSaleBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "sales.html";

        }
    );

}


// CREATE INVOICE

const createInvoiceBtn =
    document.getElementById(
        "createInvoiceBtn"
    );


if (createInvoiceBtn) {

    createInvoiceBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "invoices.html";

        }
    );

}


// ==========================================
// VIEW ALL ORDERS
// ==========================================

const viewAllOrdersBtn =
    document.getElementById(
        "viewAllOrdersBtn"
    );


if (viewAllOrdersBtn) {

    viewAllOrdersBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "orders.html";

        }
    );

}


// ==========================================
// VIEW ALL PRODUCTS
// ==========================================

const viewAllProductsBtn =
    document.getElementById(
        "viewAllProductsBtn"
    );


if (viewAllProductsBtn) {

    viewAllProductsBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "products.html";

        }
    );

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ==========================================
// START FIREBASE LISTENERS
// ==========================================

loadOrdersFromFirebase();

loadProductsFromFirebase();


// ==========================================
// LOG
// ==========================================

console.log(
    "BizManager Dashboard Firebase Loaded Successfully"
);
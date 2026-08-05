// ==========================================
// BIZMANAGER DASHBOARD
// FIREBASE FIRESTORE VERSION
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


// Protect dashboard

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
                    order.status !==
                    "Cancelled"
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
                    order.status ===
                    "Completed"
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
                    customer.phone
                );

            }

            else if (
                customer.email
            ) {

                uniqueCustomers.add(
                    customer.email
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
    // DISPLAY
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

        console.warn(
            "recentSalesBody was not found in dashboard.html"
        );

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
                        new Date(
                            b.date || 0
                        ) -
                        new Date(
                            a.date || 0
                        )
                    );

                }
            )
            .slice(
                0,
                5
            );


    // ======================================
    // DISPLAY
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

                            ${
                                initials ||
                                "CU"
                            }

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

                    ${formatMoney(
                        order.total
                    )}

                </td>


                <td>

                    <span
                        class="status ${statusClass}"
                    >

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


    // ======================================
    // FIND LOW STOCK PRODUCTS
    // ======================================

    const lowStockProducts =
        products.filter(
            product =>
                getProductStock(
                    product
                ) <= 5
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

                        <i
                            class="
                                fa-solid
                                ${icon}
                            "
                        ></i>

                    </div>


                    <div class="stock-info">

                        <strong>

                            ${getProductName(
                                product
                            )}

                        </strong>


                        <span>

                            ${
                                product.category ||
                                "Product"
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
// FIREBASE ORDERS LISTENER
// ==========================================

function loadOrdersFromFirebase() {

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
                "Dashboard orders loaded:",
                orders
            );


            refreshDashboard();

        },

        error => {

            console.error(
                "Firebase orders error:",
                error
            );

        }

    );

}


// ==========================================
// FIREBASE PRODUCTS LISTENER
// ==========================================

function loadProductsFromFirebase() {

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
                "Dashboard products loaded:",
                products
            );


            refreshDashboard();

        },

        error => {

            console.error(
                "Firebase products error:",
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

const lowStockSummary =
    document.getElementById("lowStockSummary");

if (lowStockSummary) {

    lowStockSummary.textContent =
        lowStockProducts.length === 0
            ? "No low stock products"
            : `${lowStockProducts.length} low stock product${
                lowStockProducts.length === 1
                    ? ""
                    : "s"
            }`;

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
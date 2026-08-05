// ==========================================
// BIZMANAGER ADMIN ORDERS
// FIREBASE FIRESTORE VERSION
// ==========================================


// ==========================================
// FIREBASE IMPORTS
// ==========================================

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";





// ==========================================
// FIREBASE COLLECTION
// ==========================================

const ordersCollection =
    collection(db, "orders");


// ==========================================
// ORDERS DATA
// ==========================================

let orders = [];


// ==========================================
// ELEMENTS
// ==========================================

const tableBody =
    document.getElementById(
        "ordersTableBody"
    );

const emptyOrders =
    document.getElementById(
        "ordersEmpty"
    );

const searchInput =
    document.getElementById(
        "orderSearch"
    );

const statusFilter =
    document.getElementById(
        "orderStatusFilter"
    );

const orderModal =
    document.getElementById(
        "orderModal"
    );

const closeOrderModal =
    document.getElementById(
        "closeOrderModal"
    );

const orderDetails =
    document.getElementById(
        "orderDetails"
    );


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

    if (!date) {
        return "-";
    }

    return new Date(date)
        .toLocaleDateString(
            "en-GH",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {

    return `GH₵${Number(amount || 0)
        .toFixed(2)}`;

}


// ==========================================
// STATUS CLASS
// ==========================================

function getStatusClass(status) {

    return String(status || "")
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

}


// ==========================================
// LOAD ORDERS FROM FIREBASE
// ==========================================

async function loadOrders() {

    try {

        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >

                    Loading orders...

                </td>

            </tr>

        `;


        // ==================================
        // GET ORDERS
        // ==================================

        let snapshot;


        try {

            const ordersQuery =
                query(
                    ordersCollection,
                    orderBy(
                        "date",
                        "desc"
                    )
                );


            snapshot =
                await getDocs(
                    ordersQuery
                );

        }

        catch (error) {

            console.warn(
                "Could not order by date. Loading orders normally.",
                error
            );


            snapshot =
                await getDocs(
                    ordersCollection
                );

        }


        orders =
            snapshot.docs.map(
                documentSnapshot => ({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            );


        // ==================================
        // SORT NEWEST FIRST
        // ==================================

        orders.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.date || 0
                    );

                const dateB =
                    new Date(
                        b.date || 0
                    );

                return dateB - dateA;

            }
        );


        updateStats();

        displayOrders();

    }

    catch (error) {

        console.error(
            "Error loading orders:",
            error
        );


        tableBody.innerHTML = "";


        emptyOrders.style.display =
            "block";


        emptyOrders.innerHTML = `

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h3>
                Orders could not be loaded
            </h3>

            <p>
                ${error.message}
            </p>

        `;


        alert(
            "Orders could not be loaded.\n\n" +
            error.message
        );

    }

}


// ==========================================
// DISPLAY STATS
// ==========================================

function updateStats() {

    const pending =
        orders.filter(
            order =>
                order.status ===
                "Pending"
        ).length;


    const processing =
        orders.filter(
            order =>
                order.status ===
                "Processing"
        ).length;


    const completed =
        orders.filter(
            order =>
                order.status ===
                "Completed"
        ).length;


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


    const totalOrdersElement =
        document.getElementById(
            "totalOrders"
        );


    const pendingOrdersElement =
        document.getElementById(
            "pendingOrders"
        );


    const processingOrdersElement =
        document.getElementById(
            "processingOrders"
        );


    const completedOrdersElement =
        document.getElementById(
            "completedOrders"
        );


    const totalSalesElement =
        document.getElementById(
            "totalSales"
        );


    if (totalOrdersElement) {

        totalOrdersElement.textContent =
            orders.length;

    }


    if (pendingOrdersElement) {

        pendingOrdersElement.textContent =
            pending;

    }


    if (processingOrdersElement) {

        processingOrdersElement.textContent =
            processing;

    }


    if (completedOrdersElement) {

        completedOrdersElement.textContent =
            completed;

    }


    if (totalSalesElement) {

        totalSalesElement.textContent =
            formatMoney(
                totalSales
            );

    }

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders() {

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const status =
        statusFilter
            ? statusFilter.value
            : "all";


    const filtered =
        orders.filter(
            order => {

                const customer =
                    order.customer ||
                    {};


                const customerName =
                    (
                        customer.name ||
                        order.customerName ||
                        ""
                    )
                    .toLowerCase();


                const customerPhone =
                    (
                        customer.phone ||
                        ""
                    )
                    .toLowerCase();


                const orderId =
                    (
                        order.orderId ||
                        order.id ||
                        ""
                    )
                    .toLowerCase();


                const matchesSearch =

                    orderId.includes(
                        search
                    )

                    ||

                    customerName.includes(
                        search
                    )

                    ||

                    customerPhone.includes(
                        search
                    );


                const matchesStatus =

                    status === "all"

                    ||

                    order.status ===
                    status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    tableBody.innerHTML = "";


    if (
        filtered.length === 0
    ) {

        emptyOrders.style.display =
            "block";

        return;

    }


    emptyOrders.style.display =
        "none";


    filtered.forEach(
        order => {

            const row =
                document.createElement(
                    "tr"
                );


            const customer =
                order.customer ||
                {};


            const customerName =
                customer.name ||
                order.customerName ||
                "Unknown";


            const customerPhone =
                customer.phone ||
                "";


            const orderNumber =
                order.orderId ||
                order.id;


            const paymentMethod =
                order.paymentMethod ||
                "Not specified";


            const status =
                order.status ||
                "Pending";


            row.innerHTML = `

                <td>

                    <span class="order-id">

                        ${orderNumber}

                    </span>

                </td>


                <td>

                    <span class="customer-name">

                        ${customerName}

                    </span>

                    <span class="customer-phone">

                        ${customerPhone}

                    </span>

                </td>


                <td>

                    ${formatDate(
                        order.date
                    )}

                </td>


                <td>

                    ${paymentMethod}

                </td>


                <td>

                    <strong>

                        ${formatMoney(
                            order.total
                        )}

                    </strong>

                </td>


                <td>

                    <span class="
                        order-status
                        status-${getStatusClass(
                            status
                        )}
                    ">

                        ${status}

                    </span>

                </td>


                <td>

                    <button
                        class="view-order-btn"
                        data-id="${order.id}"
                        title="View Order"
                    >

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </td>

            `;


            // ==================================
            // VIEW BUTTON
            // ==================================

            const viewButton =
                row.querySelector(
                    ".view-order-btn"
                );


            viewButton.addEventListener(
                "click",
                function () {

                    viewOrder(
                        this.dataset.id
                    );

                }
            );


            tableBody.appendChild(
                row
            );

        }
    );

}


// ==========================================
// VIEW ORDER
// ==========================================

function viewOrder(
    orderId
) {

    const order =
        orders.find(
            item =>
                item.id ===
                orderId
        );


    if (!order) {

        alert(
            "Order could not be found."
        );

        return;

    }


    const customer =
        order.customer ||
        {};


    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    let productsHTML = "";


    if (
        items.length === 0
    ) {

        productsHTML = `

            <p>
                No products found for this order.
            </p>

        `;

    }

    else {

        items.forEach(
            item => {

                const itemName =
                    item.name ||
                    item.productName ||
                    "Product";


                const quantity =
                    Number(
                        item.quantity || 0
                    );


                const price =
                    Number(
                        item.price || 0
                    );


                productsHTML += `

                    <div class="order-product-row">

                        <span>

                            ${itemName}

                            × ${quantity}

                        </span>


                        <strong>

                            ${formatMoney(
                                price *
                                quantity
                            )}

                        </strong>

                    </div>

                `;

            }
        );

    }


    const orderNumber =
        order.orderId ||
        order.id;


    const customerName =
        customer.name ||
        order.customerName ||
        "N/A";


    const customerPhone =
        customer.phone ||
        "N/A";


    const customerEmail =
        customer.email ||
        "N/A";


    const customerCity =
        customer.city ||
        customer.location ||
        "N/A";


    const customerAddress =
        customer.address ||
        "N/A";


    const customerNote =
        customer.note ||
        "";


    const paymentMethod =
        order.paymentMethod ||
        "Not specified";


    const status =
        order.status ||
        "Pending";


    orderDetails.innerHTML = `

        <div class="order-details-header">

            <h2>

                ${orderNumber}

            </h2>


            <p>

                Placed on
                ${formatDate(
                    order.date
                )}

            </p>

        </div>


        <div class="order-detail-section">

            <h3>
                Customer Information
            </h3>


            <div class="order-customer-box">

                <strong>

                    ${customerName}

                </strong>

                <br>

                Phone:
                ${customerPhone}

                <br>

                Email:
                ${customerEmail}

                <br>

                City:
                ${customerCity}

                <br>

                Address:
                ${customerAddress}


                ${
                    customerNote
                    ? `

                        <br>

                        Note:
                        ${customerNote}

                    `
                    : ""
                }

            </div>

        </div>


        <div class="order-detail-section">

            <h3>

                Ordered Products

            </h3>


            ${productsHTML}

        </div>


        <div class="order-total-box">

            <span>

                TOTAL

            </span>


            <strong>

                ${formatMoney(
                    order.total
                )}

            </strong>

        </div>


        <div class="order-detail-section">

            <h3>

                Payment

            </h3>


            <p style="
                font-size:10px;
                color:#6b7280;
            ">

                ${paymentMethod}

            </p>

        </div>


        <div class="order-status-control">

            <h3>

                Update Order Status

            </h3>


            <select id="modalStatus">

                <option
                    value="Pending"
                    ${status === "Pending"
                        ? "selected"
                        : ""}
                >

                    Pending

                </option>


                <option
                    value="Processing"
                    ${status === "Processing"
                        ? "selected"
                        : ""}
                >

                    Processing

                </option>


                <option
                    value="Completed"
                    ${status === "Completed"
                        ? "selected"
                        : ""}
                >

                    Completed

                </option>


                <option
                    value="Cancelled"
                    ${status === "Cancelled"
                        ? "selected"
                        : ""}
                >

                    Cancelled

                </option>

            </select>

        </div>


        <button
            class="print-order-btn"
            id="printOrderButton"
        >

            <i class="fa-solid fa-print"></i>

            Print Order

        </button>

    `;


    // ==================================
    // STATUS CHANGE
    // ==================================

    document
        .getElementById(
            "modalStatus"
        )
        .addEventListener(
            "change",
            function () {

                updateOrderStatus(
                    order.id,
                    this.value
                );

            }
        );


    // ==================================
    // PRINT
    // ==================================

    document
        .getElementById(
            "printOrderButton"
        )
        .addEventListener(
            "click",
            function () {

                printOrder(
                    order.id
                );

            }
        );


    orderModal.classList.add(
        "show"
    );

}


// ==========================================
// UPDATE ORDER STATUS
// FIREBASE
// ==========================================

async function updateOrderStatus(
    orderId,
    newStatus
) {

    const order =
        orders.find(
            item =>
                item.id ===
                orderId
        );


    if (!order) {

        alert(
            "Order could not be found."
        );

        return;

    }


    try {

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );


        await updateDoc(
            orderRef,
            {

                status:
                    newStatus

            }
        );


        // Update local array

        order.status =
            newStatus;


        updateStats();

        displayOrders();


        // Refresh modal

        viewOrder(
            orderId
        );


    }

    catch (error) {

        console.error(
            "Error updating order:",
            error
        );


        alert(
            "Order status could not be updated.\n\n" +
            error.message
        );

    }

}


// ==========================================
// PRINT ORDER
// ==========================================

function printOrder(
    orderId
) {

    const order =
        orders.find(
            item =>
                item.id ===
                orderId
        );


    if (!order) {

        alert(
            "Order could not be found."
        );

        return;

    }


    const customer =
        order.customer ||
        {};


    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    let itemsHTML = "";


    items.forEach(
        item => {

            const name =
                item.name ||
                item.productName ||
                "Product";


            const quantity =
                Number(
                    item.quantity || 0
                );


            const price =
                Number(
                    item.price || 0
                );


            itemsHTML += `

                <tr>

                    <td>

                        ${name}

                    </td>


                    <td>

                        ${quantity}

                    </td>


                    <td>

                        ${formatMoney(
                            price
                        )}

                    </td>


                    <td>

                        ${formatMoney(
                            price *
                            quantity
                        )}

                    </td>

                </tr>

            `;

        }
    );


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to print the order."
        );

        return;

    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>

                ${order.orderId || order.id}

            </title>


            <style>

                body {

                    font-family: Arial;

                    padding: 40px;

                    color: #222;

                }


                h1 {

                    color: #4c1d95;

                }


                .customer {

                    margin: 25px 0;

                    line-height: 1.7;

                }


                table {

                    width: 100%;

                    border-collapse: collapse;

                    margin-top: 20px;

                }


                th,
                td {

                    padding: 12px;

                    border-bottom:
                        1px solid #ddd;

                    text-align: left;

                }


                .total {

                    text-align: right;

                    font-size: 20px;

                    font-weight: bold;

                    margin-top: 25px;

                }

            </style>

        </head>


        <body>

            <h1>

                BizManager

            </h1>


            <h2>

                Order
                ${order.orderId || order.id}

            </h2>


            <div class="customer">

                <strong>
                    Customer:
                </strong>

                ${customer.name ||
                    order.customerName ||
                    "N/A"}

                <br>


                <strong>
                    Phone:
                </strong>

                ${customer.phone ||
                    "N/A"}

                <br>


                <strong>
                    Email:
                </strong>

                ${customer.email ||
                    "N/A"}

                <br>


                <strong>
                    Address:
                </strong>

                ${customer.address ||
                    customer.city ||
                    "N/A"}

                <br>


                <strong>
                    Payment:
                </strong>

                ${order.paymentMethod ||
                    "Not specified"}

                <br>


                <strong>
                    Status:
                </strong>

                ${order.status ||
                    "Pending"}

            </div>


            <table>

                <thead>

                    <tr>

                        <th>
                            Product
                        </th>

                        <th>
                            Qty
                        </th>

                        <th>
                            Price
                        </th>

                        <th>
                            Total
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${itemsHTML}

                </tbody>

            </table>


            <div class="total">

                Total:
                ${formatMoney(
                    order.total
                )}

            </div>

        </body>

        </html>

    `);


    printWindow.document.close();


    printWindow.focus();


    printWindow.print();

}


// ==========================================
// CLOSE MODAL
// ==========================================

if (closeOrderModal) {

    closeOrderModal.addEventListener(
        "click",
        function () {

            orderModal.classList.remove(
                "show"
            );

        }
    );

}


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

if (orderModal) {

    orderModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                orderModal
            ) {

                orderModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


// ==========================================
// SEARCH
// ==========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        displayOrders
    );

}


// ==========================================
// STATUS FILTER
// ==========================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        displayOrders
    );

}


// ==========================================
// MOBILE SIDEBAR
// ==========================================

const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const sidebar =
    document.querySelector(
        ".sidebar"
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

            if (
                confirm(
                    "Are you sure you want to logout?"
                )
            ) {

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
// INITIAL LOAD
// ==========================================

loadOrders();
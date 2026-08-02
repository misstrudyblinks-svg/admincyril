// ==========================================
// BIZMANAGER ADMIN ORDERS
// ==========================================


let orders =
    JSON.parse(
        localStorage.getItem("orders")
    ) || [];


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


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date) {

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

    return `GH₵${Number(amount)
        .toFixed(2)}`;

}


// ==========================================
// STATUS CLASS
// ==========================================

function getStatusClass(status) {

    return status
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

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
                ) =>
                    total +
                    Number(
                        order.total
                    ),
                0
            );


    document.getElementById(
        "totalOrders"
    ).textContent =
        orders.length;


    document.getElementById(
        "pendingOrders"
    ).textContent =
        pending;


    document.getElementById(
        "processingOrders"
    ).textContent =
        processing;


    document.getElementById(
        "completedOrders"
    ).textContent =
        completed;


    document.getElementById(
        "totalSales"
    ).textContent =
        formatMoney(
            totalSales
        );

}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const status =
        statusFilter.value;


    const filtered =
        orders.filter(
            order => {

                const customerName =
                    order.customer
                        ?.name
                        ?.toLowerCase() ||
                    "";


                const orderId =
                    order.id
                        ?.toLowerCase() ||
                    "";


                const phone =
                    order.customer
                        ?.phone
                        ?.toLowerCase() ||
                    "";


                const matchesSearch =
                    orderId.includes(
                        search
                    ) ||
                    customerName.includes(
                        search
                    ) ||
                    phone.includes(
                        search
                    );


                const matchesStatus =
                    status === "all" ||
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


    filtered
        .slice()
        .reverse()
        .forEach(
            order => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const customer =
                    order.customer ||
                    {};


                row.innerHTML = `

                    <td>

                        <span class="order-id">

                            ${order.id}

                        </span>

                    </td>


                    <td>

                        <span class="customer-name">

                            ${customer.name || "Unknown"}

                        </span>

                        <span class="customer-phone">

                            ${customer.phone || ""}

                        </span>

                    </td>


                    <td>

                        ${formatDate(order.date)}

                    </td>


                    <td>

                        ${order.paymentMethod || "Not specified"}

                    </td>


                    <td>

                        <strong>

                            ${formatMoney(order.total)}

                        </strong>

                    </td>


                    <td>

                        <span class="
                            order-status
                            status-${getStatusClass(order.status)}
                        ">

                            ${order.status}

                        </span>

                    </td>


                    <td>

                        <button
                            class="view-order-btn"
                            onclick="viewOrder('${order.id}')">

                            <i class="fa-solid fa-eye"></i>

                        </button>

                    </td>

                `;


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


    if (!order) return;


    const customer =
        order.customer ||
        {};


    const details =
        document.getElementById(
            "orderDetails"
        );


    let productsHTML = "";


    order.items.forEach(
        item => {

            productsHTML += `

                <div class="order-product-row">

                    <span>

                        ${item.name}

                        × ${item.quantity}

                    </span>

                    <strong>

                        ${formatMoney(
                            item.price *
                            item.quantity
                        )}

                    </strong>

                </div>

            `;

        }
    );


    details.innerHTML = `

        <div class="order-details-header">

            <h2>

                ${order.id}

            </h2>

            <p>

                Placed on
                ${formatDate(order.date)}

            </p>

        </div>


        <div class="order-detail-section">

            <h3>
                Customer Information
            </h3>


            <div class="order-customer-box">

                <strong>
                    ${customer.name || "N/A"}
                </strong>

                <br>

                Phone:
                ${customer.phone || "N/A"}

                <br>

                Email:
                ${customer.email || "N/A"}

                <br>

                City:
                ${customer.city || "N/A"}

                <br>

                Address:
                ${customer.address || "N/A"}

                ${
                    customer.note
                    ? `
                        <br>
                        Note:
                        ${customer.note}
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
                ${formatMoney(order.total)}
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

                ${order.paymentMethod}

            </p>

        </div>


        <div class="order-status-control">

            <h3>
                Update Order Status
            </h3>


            <select
                id="modalStatus"
                onchange="updateOrderStatus('${order.id}', this.value)">

                <option
                    value="Pending"
                    ${order.status === "Pending"
                        ? "selected"
                        : ""}>

                    Pending

                </option>


                <option
                    value="Processing"
                    ${order.status === "Processing"
                        ? "selected"
                        : ""}>

                    Processing

                </option>


                <option
                    value="Completed"
                    ${order.status === "Completed"
                        ? "selected"
                        : ""}>

                    Completed

                </option>


                <option
                    value="Cancelled"
                    ${order.status === "Cancelled"
                        ? "selected"
                        : ""}>

                    Cancelled

                </option>

            </select>

        </div>


        <button
            class="print-order-btn"
            onclick="printOrder('${order.id}')">

            <i class="fa-solid fa-print"></i>

            Print Order

        </button>

    `;


    document
        .getElementById(
            "orderModal"
        )
        .classList.add(
            "show"
        );

}


// ==========================================
// UPDATE STATUS
// ==========================================

function updateOrderStatus(
    orderId,
    newStatus
) {

    const order =
        orders.find(
            item =>
                item.id ===
                orderId
        );


    if (!order) return;


    order.status =
        newStatus;


    localStorage.setItem(
        "orders",
        JSON.stringify(
            orders
        )
    );


    updateStats();

    displayOrders();

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


    if (!order) return;


    const customer =
        order.customer ||
        {};


    let itemsHTML = "";


    order.items.forEach(
        item => {

            itemsHTML += `

                <tr>

                    <td>
                        ${item.name}
                    </td>

                    <td>
                        ${item.quantity}
                    </td>

                    <td>
                        ${formatMoney(item.price)}
                    </td>

                    <td>
                        ${formatMoney(
                            item.price *
                            item.quantity
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


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ${order.id}
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
                    border-bottom: 1px solid #ddd;
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
                Order ${order.id}
            </h2>

            <div class="customer">

                <strong>
                    Customer:
                </strong>

                ${customer.name || "N/A"}

                <br>

                <strong>
                    Phone:
                </strong>

                ${customer.phone || "N/A"}

                <br>

                <strong>
                    Address:
                </strong>

                ${customer.address || "N/A"}

                <br>

                <strong>
                    Payment:
                </strong>

                ${order.paymentMethod}

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
                ${formatMoney(order.total)}

            </div>

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.print();

}


// ==========================================
// CLOSE MODAL
// ==========================================

document.getElementById(
    "closeOrderModal"
).addEventListener(
    "click",
    function() {

        document
            .getElementById(
                "orderModal"
            )
            .classList.remove(
                "show"
            );

    }
);


// ==========================================
// SEARCH & FILTER
// ==========================================

searchInput.addEventListener(
    "input",
    displayOrders
);


statusFilter.addEventListener(
    "change",
    displayOrders
);


// ==========================================
// START
// ==========================================

updateStats();

displayOrders();
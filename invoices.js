// ==========================================
// INVOICE MANAGEMENT
// ==========================================


// AUTHENTICATION

if (
    localStorage.getItem("adminLoggedIn")
    !== "true"
) {

    window.location.href =
        "login.html";

}


// LOAD SALES

let sales =
    JSON.parse(
        localStorage.getItem("sales")
    ) || [];


// LOAD INVOICES

let invoices =
    JSON.parse(
        localStorage.getItem("invoices")
    ) || [];


// ELEMENTS

const invoiceTableBody =
    document.getElementById(
        "invoiceTableBody"
    );

const emptyInvoices =
    document.getElementById(
        "emptyInvoices"
    );

const invoiceModal =
    document.getElementById(
        "invoiceModal"
    );

const invoicePaper =
    document.getElementById(
        "invoicePaper"
    );


// ==========================================
// CREATE INVOICES FROM SALES
// ==========================================

function createInvoicesFromSales() {

    sales.forEach(
        sale => {

            const exists =
                invoices.some(
                    invoice =>
                        invoice.saleId === sale.id
                );


            if (!exists) {

                const invoice = {

                    id:
                        generateInvoiceNumber(),

                    saleId:
                        sale.id,

                    customer:
                        sale.customerName ||
                        "Walk-in Customer",

                    phone:
                        sale.customerPhone ||
                        "",

                    items: [

                        {

                            name:
                                sale.productName,

                            quantity:
                                Number(
                                    sale.quantity
                                ),

                            price:
                                Number(
                                    sale.price
                                ),

                            total:
                                Number(
                                    sale.total
                                )

                        }

                    ],

                    subtotal:
                        Number(
                            sale.total
                        ),

                    total:
                        Number(
                            sale.total
                        ),

                    paymentMethod:
                        sale.paymentMethod ||
                        "Cash",

                    date:
                        sale.date ||
                        new Date()
                            .toISOString()
                            .split("T")[0]

                };


                invoices.push(
                    invoice
                );

            }

        }
    );


    localStorage.setItem(
        "invoices",
        JSON.stringify(invoices)
    );

}


// ==========================================
// INVOICE NUMBER
// ==========================================

function generateInvoiceNumber() {

    const number =
        invoices.length + 1;

    return (
        "INV-" +
        new Date()
            .getFullYear() +
        "-" +
        String(number)
            .padStart(4, "0")
    );

}


// ==========================================
// DISPLAY INVOICES
// ==========================================

function renderInvoices(
    search = ""
) {

    invoiceTableBody.innerHTML = "";


    const term =
        search.toLowerCase();


    const filtered =
        invoices.filter(
            invoice =>

                invoice.id
                    .toLowerCase()
                    .includes(term)

                ||

                invoice.customer
                    .toLowerCase()
                    .includes(term)
        );


    if (
        filtered.length === 0
    ) {

        emptyInvoices.style.display =
            "block";

    }

    else {

        emptyInvoices.style.display =
            "none";

    }


    filtered
        .slice()
        .reverse()
        .forEach(
            invoice => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        <strong
                            class="expense-id">

                            ${invoice.id}

                        </strong>

                    </td>


                    <td>

                        ${invoice.customer}

                    </td>


                    <td>

                        <strong>

                            GH₵${Number(
                                invoice.total
                            ).toFixed(2)}

                        </strong>

                    </td>


                    <td>

                        ${invoice.paymentMethod}

                    </td>


                    <td>

                        ${formatDate(
                            invoice.date
                        )}

                    </td>


                    <td>

                        <div
                            class="customer-actions">

                            <button
                                class="customer-action-btn edit-btn"
                                onclick="viewInvoice('${invoice.id}')">

                                <i class="fa-solid fa-eye"></i>

                            </button>


                            <button
                                class="customer-action-btn delete-btn"
                                onclick="deleteInvoice('${invoice.id}')">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                `;


                invoiceTableBody.appendChild(
                    row
                );

            }
        );


    updateStatistics();

}


// ==========================================
// VIEW INVOICE
// ==========================================

function viewInvoice(id) {

    const invoice =
        invoices.find(
            item =>
                item.id === id
        );


    if (!invoice) return;


    const subtotal =
        Number(
            invoice.subtotal
        );


    invoicePaper.innerHTML = `

        <div class="invoice-header">


            <div class="invoice-brand">

                <h1>
                    BizManager
                </h1>

                <p>
                    Professional Business Management
                </p>

            </div>


            <div class="invoice-title">

                <h2>
                    INVOICE
                </h2>

                <p>
                    ${invoice.id}
                </p>

            </div>


        </div>



        <div class="invoice-info">


            <div>

                <h4>
                    BILL TO
                </h4>

                <p>
                    <strong>
                        ${invoice.customer}
                    </strong>
                </p>

                <p>
                    ${invoice.phone}
                </p>

            </div>


            <div>

                <h4>
                    INVOICE DETAILS
                </h4>

                <p>
                    Invoice:
                    ${invoice.id}
                </p>

                <p>
                    Date:
                    ${formatDate(
                        invoice.date
                    )}
                </p>

                <p>
                    Payment:
                    ${invoice.paymentMethod}
                </p>

            </div>

        </div>



        <table class="invoice-items">

            <thead>

                <tr>

                    <th>
                        Item
                    </th>

                    <th>
                        Quantity
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

                ${invoice.items
                    .map(
                        item => `

                            <tr>

                                <td>
                                    ${item.name}
                                </td>

                                <td>
                                    ${item.quantity}
                                </td>

                                <td>
                                    GH₵${Number(
                                        item.price
                                    ).toFixed(2)}
                                </td>

                                <td>
                                    GH₵${Number(
                                        item.total
                                    ).toFixed(2)}
                                </td>

                            </tr>

                        `
                    )
                    .join("")
                }

            </tbody>

        </table>



        <div class="invoice-total-box">


            <div class="invoice-total-row">

                <span>
                    Subtotal
                </span>

                <strong>
                    GH₵${subtotal.toFixed(2)}
                </strong>

            </div>


            <div class="invoice-total-row">

                <span>
                    Tax
                </span>

                <strong>
                    GH₵0.00
                </strong>

            </div>


            <div class="invoice-total-row final">

                <span>
                    Total
                </span>

                <strong>
                    GH₵${Number(
                        invoice.total
                    ).toFixed(2)}
                </strong>

            </div>

        </div>



        <div class="invoice-footer">

            Thank you for doing business with us.

            <br>

            Generated by BizManager

        </div>

    `;


    invoiceModal.classList.add(
        "show"
    );

}


// ==========================================
// CLOSE
// ==========================================

document.getElementById(
    "closeInvoice"
).addEventListener(
    "click",
    function () {

        invoiceModal.classList.remove(
            "show"
        );

    }
);


// ==========================================
// PRINT
// ==========================================

document.getElementById(
    "printInvoice"
).addEventListener(
    "click",
    function () {

        window.print();

    }
);


// ==========================================
// DELETE
// ==========================================

function deleteInvoice(id) {

    if (
        !confirm(
            "Delete this invoice?"
        )
    ) {

        return;

    }


    invoices =
        invoices.filter(
            invoice =>
                invoice.id !== id
        );


    localStorage.setItem(
        "invoices",
        JSON.stringify(invoices)
    );


    renderInvoices();

}


// ==========================================
// SEARCH
// ==========================================

document.getElementById(
    "invoiceSearch"
).addEventListener(
    "input",
    function () {

        renderInvoices(
            this.value
        );

    }
);


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        invoices.reduce(
            (
                sum,
                invoice
            ) =>
                sum +
                Number(invoice.total),
            0
        );


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayCount =
        invoices.filter(
            invoice =>
                invoice.date === today
        ).length;


    const average =
        invoices.length
            ? total / invoices.length
            : 0;


    document.getElementById(
        "invoiceCount"
    ).textContent =
        invoices.length;


    document.getElementById(
        "invoiceRevenue"
    ).textContent =
        `GH₵${total.toFixed(2)}`;


    document.getElementById(
        "todayInvoices"
    ).textContent =
        todayCount;


    document.getElementById(
        "averageInvoice"
    ).textContent =
        `GH₵${average.toFixed(2)}`;

}


// ==========================================
// DATE
// ==========================================

function formatDate(dateString) {

    if (!dateString) return "-";


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-GH",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// MOBILE SIDEBAR
// ==========================================

document.getElementById(
    "menuToggle"
).addEventListener(
    "click",
    function () {

        document.getElementById(
            "sidebar"
        ).classList.toggle(
            "open"
        );

    }
);


// ==========================================
// LOGOUT
// ==========================================

document.getElementById(
    "logoutBtn"
).addEventListener(
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


// ==========================================
// START
// ==========================================

createInvoicesFromSales();

renderInvoices();
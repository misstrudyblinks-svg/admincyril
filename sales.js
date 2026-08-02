// ==========================================
// SALES MANAGEMENT SYSTEM
// ==========================================


// ==========================================
// AUTHENTICATION
// ==========================================

const loggedIn =
    localStorage.getItem("adminLoggedIn");

if (loggedIn !== "true") {

    window.location.href =
        "login.html";

}


// ==========================================
// DATABASES
// ==========================================

let customers =
    JSON.parse(
        localStorage.getItem("customers")
    ) || [];


let products =
    JSON.parse(
        localStorage.getItem("products")
    ) || [];


let sales =
    JSON.parse(
        localStorage.getItem("sales")
    ) || [];


// ==========================================
// ELEMENTS
// ==========================================

const saleModal =
    document.getElementById(
        "saleModal"
    );

const openSaleModal =
    document.getElementById(
        "openSaleModal"
    );

const closeSaleModal =
    document.getElementById(
        "closeSaleModal"
    );

const cancelSale =
    document.getElementById(
        "cancelSale"
    );

const saleForm =
    document.getElementById(
        "saleForm"
    );

const saleCustomer =
    document.getElementById(
        "saleCustomer"
    );

const saleProduct =
    document.getElementById(
        "saleProduct"
    );

const salePrice =
    document.getElementById(
        "salePrice"
    );

const availableStock =
    document.getElementById(
        "availableStock"
    );

const saleQuantity =
    document.getElementById(
        "saleQuantity"
    );

const saleTotal =
    document.getElementById(
        "saleTotal"
    );

const salesTableBody =
    document.getElementById(
        "salesTableBody"
    );

const emptySales =
    document.getElementById(
        "emptySales"
    );

const saleSearch =
    document.getElementById(
        "saleSearch"
    );


// ==========================================
// OPEN MODAL
// ==========================================

openSaleModal.addEventListener(
    "click",
    function () {

        refreshDatabase();

        saleForm.reset();

        salePrice.value = "";

        availableStock.value = "";

        saleQuantity.value = 1;

        saleTotal.textContent =
            "GH₵0.00";

        loadCustomers();

        loadProducts();

        saleModal.classList.add(
            "show"
        );

    }
);


// ==========================================
// CLOSE MODAL
// ==========================================

function closeSale() {

    saleModal.classList.remove(
        "show"
    );

}


closeSaleModal.addEventListener(
    "click",
    closeSale
);


cancelSale.addEventListener(
    "click",
    closeSale
);


saleModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === saleModal
        ) {

            closeSale();

        }

    }
);


// ==========================================
// REFRESH DATABASE
// ==========================================

function refreshDatabase() {

    customers =
        JSON.parse(
            localStorage.getItem("customers")
        ) || [];

    products =
        JSON.parse(
            localStorage.getItem("products")
        ) || [];

    sales =
        JSON.parse(
            localStorage.getItem("sales")
        ) || [];

}


// ==========================================
// LOAD CUSTOMERS
// ==========================================

function loadCustomers() {

    saleCustomer.innerHTML = `
        <option value="">
            Select Customer
        </option>
    `;


    customers.forEach(
        customer => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                customer.id;

            option.textContent =
                customer.name;

            saleCustomer.appendChild(
                option
            );

        }
    );

}


// ==========================================
// LOAD PRODUCTS
// ==========================================

function loadProducts() {

    saleProduct.innerHTML = `
        <option value="">
            Select Product
        </option>
    `;


    products
        .filter(
            product =>
                product.stock > 0
        )
        .forEach(
            product => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    product.id;

                option.textContent =
                    `${product.name} — GH₵${product.price.toFixed(2)}`;

                saleProduct.appendChild(
                    option
                );

            }
        );

}


// ==========================================
// PRODUCT SELECT
// ==========================================

saleProduct.addEventListener(
    "change",
    function () {

        const product =
            products.find(
                product =>
                    product.id ===
                    saleProduct.value
            );


        if (!product) {

            salePrice.value = "";

            availableStock.value = "";

            calculateTotal();

            return;

        }


        salePrice.value =
            `GH₵${product.price.toFixed(2)}`;

        availableStock.value =
            product.stock;


        saleQuantity.max =
            product.stock;


        calculateTotal();

    }
);


// ==========================================
// QUANTITY CHANGE
// ==========================================

saleQuantity.addEventListener(
    "input",
    calculateTotal
);


// ==========================================
// CALCULATE TOTAL
// ==========================================

function calculateTotal() {

    const product =
        products.find(
            product =>
                product.id ===
                saleProduct.value
        );


    if (!product) {

        saleTotal.textContent =
            "GH₵0.00";

        return;

    }


    const quantity =
        Number(
            saleQuantity.value
        ) || 0;


    const total =
        product.price *
        quantity;


    saleTotal.textContent =
        `GH₵${total.toFixed(2)}`;

}


// ==========================================
// COMPLETE SALE
// ==========================================

saleForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        refreshDatabase();


        const customer =
            customers.find(
                customer =>
                    customer.id ===
                    saleCustomer.value
            );


        const productIndex =
            products.findIndex(
                product =>
                    product.id ===
                    saleProduct.value
            );


        if (!customer) {

            alert(
                "Please select a customer."
            );

            return;

        }


        if (productIndex === -1) {

            alert(
                "Please select a product."
            );

            return;

        }


        const product =
            products[productIndex];


        const quantity =
            Number(
                saleQuantity.value
            );


        if (
            !quantity ||
            quantity < 1
        ) {

            alert(
                "Please enter a valid quantity."
            );

            return;

        }


        if (
            quantity >
            product.stock
        ) {

            alert(
                `Only ${product.stock} units of ${product.name} are available.`
            );

            return;

        }


        const total =
            product.price *
            quantity;


        // ==================================
        // CREATE SALE
        // ==================================

        const newSale = {

            id:
                "ORD-" +
                Date.now(),

            customerId:
                customer.id,

            customerName:
                customer.name,

            productId:
                product.id,

            productName:
                product.name,

            quantity:
                quantity,

            price:
                product.price,

            total:
                total,

            date:
                new Date().toISOString()

        };


        sales.unshift(
            newSale
        );


        // ==================================
        // REDUCE PRODUCT STOCK
        // ==================================

        products[productIndex].stock -=
            quantity;


        // ==================================
        // SAVE DATABASE
        // ==================================

        localStorage.setItem(
            "sales",
            JSON.stringify(sales)
        );


        localStorage.setItem(
            "products",
            JSON.stringify(products)
        );


        alert(
            `Sale completed successfully!\n\nOrder: ${newSale.id}\nTotal: GH₵${total.toFixed(2)}`
        );


        closeSale();

        renderSales();

    }
);


// ==========================================
// DISPLAY SALES
// ==========================================

function renderSales(
    searchTerm = ""
) {

    salesTableBody.innerHTML = "";


    const search =
        searchTerm.toLowerCase();


    const filteredSales =
        sales.filter(
            sale =>

                sale.id
                    .toLowerCase()
                    .includes(search)

                ||

                sale.customerName
                    .toLowerCase()
                    .includes(search)

                ||

                sale.productName
                    .toLowerCase()
                    .includes(search)
        );


    if (
        filteredSales.length === 0
    ) {

        emptySales.style.display =
            "block";

    }

    else {

        emptySales.style.display =
            "none";

    }


    filteredSales.forEach(
        sale => {

            const row =
                document.createElement(
                    "tr"
                );


            const date =
                new Date(
                    sale.date
                );


            row.innerHTML = `

                <td>

                    <span class="sale-order-id">

                        ${sale.id}

                    </span>

                </td>


                <td>

                    ${sale.customerName}

                </td>


                <td>

                    ${sale.productName}

                </td>


                <td>

                    ${sale.quantity}

                </td>


                <td>

                    <strong>

                        GH₵${sale.total.toFixed(2)}

                    </strong>

                </td>


                <td>

                    <span class="sale-date">

                        ${date.toLocaleDateString()}

                    </span>

                </td>


                <td>

                    <div class="customer-actions">

                        <button
                            class="customer-action-btn edit-btn"
                            onclick="viewSale('${sale.id}')">

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            class="customer-action-btn delete-btn"
                            onclick="deleteSale('${sale.id}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            salesTableBody.appendChild(
                row
            );

        }
    );


    updateSalesStatistics();

}


// ==========================================
// VIEW SALE
// ==========================================

function viewSale(id) {

    const sale =
        sales.find(
            sale =>
                sale.id === id
        );


    if (!sale) return;


    const date =
        new Date(
            sale.date
        );


    alert(

        `ORDER DETAILS\n\n` +

        `Order ID: ${sale.id}\n` +

        `Customer: ${sale.customerName}\n` +

        `Product: ${sale.productName}\n` +

        `Quantity: ${sale.quantity}\n` +

        `Unit Price: GH₵${sale.price.toFixed(2)}\n` +

        `Total: GH₵${sale.total.toFixed(2)}\n` +

        `Date: ${date.toLocaleString()}`

    );

}


// ==========================================
// DELETE SALE
// ==========================================

function deleteSale(id) {

    const sale =
        sales.find(
            sale =>
                sale.id === id
        );


    if (!sale) return;


    const confirmed =
        confirm(
            `Delete order ${sale.id}?\n\nThe sold quantity will be returned to inventory.`
        );


    if (!confirmed) return;


    // Find product

    const productIndex =
        products.findIndex(
            product =>
                product.id ===
                sale.productId
        );


    // Return stock

    if (
        productIndex !== -1
    ) {

        products[productIndex].stock +=
            sale.quantity;

    }


    // Remove sale

    sales =
        sales.filter(
            sale =>
                sale.id !== id
        );


    // Save

    localStorage.setItem(
        "sales",
        JSON.stringify(sales)
    );


    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );


    renderSales();

}


// ==========================================
// SEARCH
// ==========================================

saleSearch.addEventListener(
    "input",
    function () {

        renderSales(
            saleSearch.value
        );

    }
);


// ==========================================
// SALES STATISTICS
// ==========================================

function updateSalesStatistics() {

    const totalOrders =
        sales.length;


    const revenue =
        sales.reduce(
            (
                total,
                sale
            ) =>
                total +
                sale.total,
            0
        );


    const average =
        totalOrders > 0
            ? revenue / totalOrders
            : 0;


    const today =
        new Date();


    const todayRevenue =
        sales
            .filter(
                sale => {

                    const date =
                        new Date(
                            sale.date
                        );


                    return (

                        date.getDate()
                            === today.getDate()

                        &&

                        date.getMonth()
                            === today.getMonth()

                        &&

                        date.getFullYear()
                            === today.getFullYear()

                    );

                }
            )
            .reduce(
                (
                    total,
                    sale
                ) =>
                    total +
                    sale.total,
                0
            );


    document.getElementById(
        "totalOrders"
    ).textContent =
        totalOrders;


    document.getElementById(
        "totalRevenue"
    ).textContent =
        `GH₵${revenue.toFixed(2)}`;


    document.getElementById(
        "averageSale"
    ).textContent =
        `GH₵${average.toFixed(2)}`;


    document.getElementById(
        "todaySales"
    ).textContent =
        `GH₵${todayRevenue.toFixed(2)}`;

}


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


menuToggle.addEventListener(
    "click",
    function () {

        sidebar.classList.toggle(
            "open"
        );

    }
);


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


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


// ==========================================
// INITIAL LOAD
// ==========================================

renderSales();
// ==========================================
// BIZMANAGER SALES MANAGEMENT
// FIREBASE FIRESTORE VERSION
// ==========================================

// ==========================================
// FIREBASE IMPORTS
// ==========================================

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    runTransaction,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";


// ==========================================
// AUTHENTICATION
// ==========================================

const loggedIn =
    localStorage.getItem("adminLoggedIn");

if (loggedIn !== "true") {

    window.location.href = "login.html";

}


// ==========================================
// DATABASE ARRAYS
// ==========================================

let customers = [];
let products = [];
let sales = [];


// ==========================================
// ELEMENTS
// ==========================================

const saleModal =
    document.getElementById("saleModal");

const openSaleModal =
    document.getElementById("openSaleModal");

const closeSaleModal =
    document.getElementById("closeSaleModal");

const cancelSale =
    document.getElementById("cancelSale");

const saleForm =
    document.getElementById("saleForm");

const saleCustomer =
    document.getElementById("saleCustomer");

const saleProduct =
    document.getElementById("saleProduct");

const salePrice =
    document.getElementById("salePrice");

const availableStock =
    document.getElementById("availableStock");

const saleQuantity =
    document.getElementById("saleQuantity");

const saleTotal =
    document.getElementById("saleTotal");

const salesTableBody =
    document.getElementById("salesTableBody");

const emptySales =
    document.getElementById("emptySales");

const saleSearch =
    document.getElementById("saleSearch");


// ==========================================
// LOAD ALL FIREBASE DATA
// ==========================================

async function loadDatabase() {

    try {

        // ----------------------------------
        // LOAD CUSTOMERS
        // ----------------------------------

        const customersSnapshot =
            await getDocs(
                collection(db, "customers")
            );

        customers =
            customersSnapshot.docs.map(
                document => ({

                    id: document.id,

                    ...document.data()

                })
            );


        // ----------------------------------
        // LOAD PRODUCTS
        // ----------------------------------

        const productsSnapshot =
            await getDocs(
                collection(db, "products")
            );

        products =
            productsSnapshot.docs.map(
                document => ({

                    id: document.id,

                    ...document.data()

                })
            );


        // ----------------------------------
        // LOAD SALES
        // ----------------------------------

        const salesQuery =
            query(
                collection(db, "sales"),
                orderBy("date", "desc")
            );


        const salesSnapshot =
            await getDocs(
                salesQuery
            );


        sales =
            salesSnapshot.docs.map(
                document => ({

                    id: document.id,

                    ...document.data()

                })
            );


        renderSales();

    }

    catch (error) {

        console.error(
            "Firebase loading error:",
            error
        );


        alert(
            "Could not load sales data.\n\n" +
            error.message
        );

    }

}


// ==========================================
// OPEN SALE MODAL
// ==========================================

openSaleModal.addEventListener(
    "click",
    async function () {

        saleForm.reset();

        salePrice.value = "";

        availableStock.value = "";

        saleQuantity.value = 1;

        saleTotal.textContent =
            "GH₵0.00";


        await loadCustomers();

        await loadProducts();


        saleModal.classList.add(
            "show"
        );

    }
);


// ==========================================
// CLOSE SALE MODAL
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
// LOAD CUSTOMERS
// ==========================================

async function loadCustomers() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "customers")
            );


        customers =
            snapshot.docs.map(
                document => ({

                    id: document.id,

                    ...document.data()

                })
            );


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
                    customer.name ||
                    "Unnamed Customer";


                saleCustomer.appendChild(
                    option
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Could not load customers:",
            error
        );

        alert(
            "Customers could not be loaded.\n\n" +
            error.message
        );

    }

}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "products")
            );


        products =
            snapshot.docs.map(
                document => ({

                    id: document.id,

                    ...document.data()

                })
            );


        saleProduct.innerHTML = `

            <option value="">
                Select Product
            </option>

        `;


        products
            .filter(
                product =>
                    Number(product.stock) > 0
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
                        `${product.name || "Unnamed Product"} — GH₵${Number(
                            product.price || 0
                        ).toFixed(2)}`;


                    saleProduct.appendChild(
                        option
                    );

                }
            );

    }

    catch (error) {

        console.error(
            "Could not load products:",
            error
        );

        alert(
            "Products could not be loaded.\n\n" +
            error.message
        );

    }

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

            saleTotal.textContent =
                "GH₵0.00";

            return;

        }


        const price =
            Number(
                product.price || 0
            );


        const stock =
            Number(
                product.stock || 0
            );


        salePrice.value =
            `GH₵${price.toFixed(2)}`;


        availableStock.value =
            stock;


        saleQuantity.max =
            stock;


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


    const price =
        Number(
            product.price || 0
        );


    const quantity =
        Number(
            saleQuantity.value
        ) || 0;


    const total =
        price * quantity;


    saleTotal.textContent =
        `GH₵${total.toFixed(2)}`;

}


// ==========================================
// COMPLETE SALE
// ==========================================

saleForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const customerId =
            saleCustomer.value;


        const productId =
            saleProduct.value;


        const quantity =
            Number(
                saleQuantity.value
            );


        if (!customerId) {

            alert(
                "Please select a customer."
            );

            return;

        }


        if (!productId) {

            alert(
                "Please select a product."
            );

            return;

        }


        if (
            !quantity ||
            quantity < 1
        ) {

            alert(
                "Please enter a valid quantity."
            );

            return;

        }


        try {

            // ==================================
            // FIREBASE TRANSACTION
            // ==================================

            const saleId =
                await runTransaction(
                    db,
                    async transaction => {

                        // ----------------------------------
                        // GET CUSTOMER
                        // ----------------------------------

                        const customerRef =
                            doc(
                                db,
                                "customers",
                                customerId
                            );


                        const customerSnapshot =
                            await transaction.get(
                                customerRef
                            );


                        if (
                            !customerSnapshot.exists()
                        ) {

                            throw new Error(
                                "Customer no longer exists."
                            );

                        }


                        const customer =
                            customerSnapshot.data();


                        // ----------------------------------
                        // GET PRODUCT
                        // ----------------------------------

                        const productRef =
                            doc(
                                db,
                                "products",
                                productId
                            );


                        const productSnapshot =
                            await transaction.get(
                                productRef
                            );


                        if (
                            !productSnapshot.exists()
                        ) {

                            throw new Error(
                                "Product no longer exists."
                            );

                        }


                        const product =
                            productSnapshot.data();


                        const currentStock =
                            Number(
                                product.stock || 0
                            );


                        const price =
                            Number(
                                product.price || 0
                            );


                        // ----------------------------------
                        // CHECK STOCK
                        // ----------------------------------

                        if (
                            currentStock <= 0
                        ) {

                            throw new Error(
                                "This product is out of stock."
                            );

                        }


                        if (
                            quantity >
                            currentStock
                        ) {

                            throw new Error(
                                `Only ${currentStock} units of ${product.name} are available.`
                            );

                        }


                        // ----------------------------------
                        // CALCULATE TOTAL
                        // ----------------------------------

                        const total =
                            price *
                            quantity;


                        // ----------------------------------
                        // CREATE SALE
                        // ----------------------------------

                        const saleRef =
                            doc(
                                collection(
                                    db,
                                    "sales"
                                )
                            );


                        const saleData = {

                            orderId:
                                "ORD-" +
                                Date.now(),

                            customerId:
                                customerId,

                            customerName:
                                customer.name ||
                                "Unknown Customer",

                            productId:
                                productId,

                            productName:
                                product.name ||
                                "Unnamed Product",

                            quantity:
                                quantity,

                            price:
                                price,

                            total:
                                total,

                            date:
                                new Date().toISOString()

                        };


                        transaction.set(
                            saleRef,
                            saleData
                        );


                        // ----------------------------------
                        // REDUCE STOCK
                        // ----------------------------------

                        transaction.update(
                            productRef,
                            {

                                stock:
                                    currentStock -
                                    quantity

                            }
                        );


                        return saleRef.id;

                    }
                );


            alert(
                "Sale completed successfully!"
            );


            closeSale();


            await loadDatabase();


            // Reload products for future sales

            await loadProducts();


        }

        catch (error) {

            console.error(
                "Sale error:",
                error
            );


            alert(
                "Sale could not be completed.\n\n" +
                error.message
            );

        }

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
        searchTerm
            .toLowerCase()
            .trim();


    const filteredSales =
        sales.filter(
            sale => {

                const orderId =
                    (
                        sale.orderId ||
                        sale.id ||
                        ""
                    )
                    .toLowerCase();


                const customerName =
                    (
                        sale.customerName ||
                        ""
                    )
                    .toLowerCase();


                const productName =
                    (
                        sale.productName ||
                        ""
                    )
                    .toLowerCase();


                return (

                    orderId.includes(
                        search
                    )

                    ||

                    customerName.includes(
                        search
                    )

                    ||

                    productName.includes(
                        search
                    )

                );

            }
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
                sale.date
                    ? new Date(
                        sale.date
                    )
                    : null;


            const total =
                Number(
                    sale.total || 0
                );


            const price =
                Number(
                    sale.price || 0
                );


            row.innerHTML = `

                <td>

                    <span class="sale-order-id">

                        ${sale.orderId || sale.id}

                    </span>

                </td>


                <td>

                    ${sale.customerName || "-"}

                </td>


                <td>

                    ${sale.productName || "-"}

                </td>


                <td>

                    ${sale.quantity || 0}

                </td>


                <td>

                    <strong>

                        GH₵${total.toFixed(2)}

                    </strong>

                </td>


                <td>

                    <span class="sale-date">

                        ${
                            date
                                ? date.toLocaleDateString()
                                : "-"
                        }

                    </span>

                </td>


                <td>

                    <div class="customer-actions">

                        <button
                            class="customer-action-btn edit-btn"
                            data-action="view"
                            data-id="${sale.id}">

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            class="customer-action-btn delete-btn"
                            data-action="delete"
                            data-id="${sale.id}">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            // ----------------------------------
            // VIEW BUTTON
            // ----------------------------------

            row
                .querySelector(
                    '[data-action="view"]'
                )
                .addEventListener(
                    "click",
                    function () {

                        viewSale(
                            sale.id
                        );

                    }
                );


            // ----------------------------------
            // DELETE BUTTON
            // ----------------------------------

            row
                .querySelector(
                    '[data-action="delete"]'
                )
                .addEventListener(
                    "click",
                    function () {

                        deleteSale(
                            sale.id
                        );

                    }
                );


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


    if (!sale) {

        alert(
            "Sale could not be found."
        );

        return;

    }


    const date =
        sale.date
            ? new Date(
                sale.date
            )
            : null;


    const price =
        Number(
            sale.price || 0
        );


    const total =
        Number(
            sale.total || 0
        );


    alert(

        `ORDER DETAILS\n\n` +

        `Order ID: ${
            sale.orderId ||
            sale.id
        }\n` +

        `Customer: ${
            sale.customerName ||
            "-"
        }\n` +

        `Product: ${
            sale.productName ||
            "-"
        }\n` +

        `Quantity: ${
            sale.quantity ||
            0
        }\n` +

        `Unit Price: GH₵${
            price.toFixed(2)
        }\n` +

        `Total: GH₵${
            total.toFixed(2)
        }\n` +

        `Date: ${
            date
                ? date.toLocaleString()
                : "-"
        }`

    );

}


// ==========================================
// DELETE SALE
// RETURN STOCK TO FIREBASE
// ==========================================

async function deleteSale(id) {

    const sale =
        sales.find(
            sale =>
                sale.id === id
        );


    if (!sale) {

        alert(
            "Sale could not be found."
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete order ${
                sale.orderId ||
                sale.id
            }?\n\nThe sold quantity will be returned to inventory.`
        );


    if (!confirmed) return;


    try {

        await runTransaction(
            db,
            async transaction => {

                // ----------------------------------
                // SALE REFERENCE
                // ----------------------------------

                const saleRef =
                    doc(
                        db,
                        "sales",
                        id
                    );


                // ----------------------------------
                // PRODUCT REFERENCE
                // ----------------------------------

                const productRef =
                    doc(
                        db,
                        "products",
                        sale.productId
                    );


                const productSnapshot =
                    await transaction.get(
                        productRef
                    );


                if (
                    productSnapshot.exists()
                ) {

                    const product =
                        productSnapshot.data();


                    const currentStock =
                        Number(
                            product.stock || 0
                        );


                    const returnedStock =
                        Number(
                            sale.quantity || 0
                        );


                    transaction.update(
                        productRef,
                        {

                            stock:
                                currentStock +
                                returnedStock

                        }
                    );

                }


                // ----------------------------------
                // DELETE SALE
                // ----------------------------------

                transaction.delete(
                    saleRef
                );

            }
        );


        alert(
            "Sale deleted and stock returned successfully."
        );


        await loadDatabase();

    }

    catch (error) {

        console.error(
            "Delete sale error:",
            error
        );


        alert(
            "Sale could not be deleted.\n\n" +
            error.message
        );

    }

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
            ) => {

                return (
                    total +
                    Number(
                        sale.total || 0
                    )
                );

            },
            0
        );


    const average =
        totalOrders > 0
            ? revenue /
              totalOrders
            : 0;


    const today =
        new Date();


    const todayRevenue =
        sales
            .filter(
                sale => {

                    if (!sale.date)
                        return false;


                    const date =
                        new Date(
                            sale.date
                        );


                    return (

                        date.getDate()
                            ===
                        today.getDate()

                        &&

                        date.getMonth()
                            ===
                        today.getMonth()

                        &&

                        date.getFullYear()
                            ===
                        today.getFullYear()

                    );

                }
            )
            .reduce(
                (
                    total,
                    sale
                ) => {

                    return (
                        total +
                        Number(
                            sale.total || 0
                        )
                    );

                },
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

loadDatabase();
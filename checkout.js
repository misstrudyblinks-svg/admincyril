// ==========================================
// BIZMANAGER CHECKOUT
// FIREBASE VERSION
// ==========================================

import {
    db
} from "./firebase-config.js";

import {
    collection,
    doc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// LOAD CART
// ==========================================

let cart = [];

try {

    cart =
        JSON.parse(
            localStorage.getItem("shoppingCart")
        ) || [];

}
catch (error) {

    console.error(
        "Could not load shopping cart:",
        error
    );

    cart = [];

}


// ==========================================
// ELEMENTS
// ==========================================

const checkoutItems =
    document.getElementById("checkoutItems");

const checkoutSubtotal =
    document.getElementById("checkoutSubtotal");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const summaryCount =
    document.getElementById("summaryCount");

const checkoutForm =
    document.getElementById("checkoutForm");

const successModal =
    document.getElementById("orderSuccess");

const orderNumber =
    document.getElementById("orderNumber");


// ==========================================
// FORMAT MONEY
// ==========================================

function formatMoney(amount) {

    return `GH₵${Number(amount || 0).toFixed(2)}`;

}


// ==========================================
// CHECK CART
// ==========================================

if (cart.length === 0) {

    alert(
        "Your cart is empty. Please add a product first."
    );

    window.location.href = "shop.html";

}


// ==========================================
// DISPLAY CHECKOUT
// ==========================================

function displayCheckout() {

    if (!checkoutItems) return;

    checkoutItems.innerHTML = "";

    let total = 0;

    let quantity = 0;


    cart.forEach(function(item) {

        const price =
            Number(item.price) || 0;

        const itemQuantity =
            Number(item.quantity) || 0;

        const itemTotal =
            price * itemQuantity;


        total += itemTotal;

        quantity += itemQuantity;


        const element =
            document.createElement("div");

        element.className =
            "checkout-item";


        const image =
            item.image

                ? `
                    <img
                        src="${escapeHTML(item.image)}"
                        alt="${escapeHTML(
                            item.name || "Product"
                        )}">
                  `

                : `
                    <i class="fa-solid fa-box"></i>
                  `;


        element.innerHTML = `

            <div class="checkout-item-image">

                ${image}

            </div>


            <div class="checkout-item-info">

                <h4>
                    ${escapeHTML(
                        item.name || "Unnamed Product"
                    )}
                </h4>

                <span>
                    Quantity: ${itemQuantity}
                </span>

                <strong>
                    ${formatMoney(itemTotal)}
                </strong>

            </div>

        `;


        checkoutItems.appendChild(
            element
        );

    });


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatMoney(total);

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatMoney(total);

    }


    if (summaryCount) {

        summaryCount.textContent =
            `${quantity} item${
                quantity === 1
                    ? ""
                    : "s"
            }`;

    }

}


// ==========================================
// GENERATE ORDER NUMBER
// ==========================================

function generateOrderNumber() {

    const timestamp =
        Date.now()
            .toString()
            .slice(-8);


    const random =
        Math.floor(
            100 +
            Math.random() * 900
        );


    return `ORD-${timestamp}-${random}`;

}


// ==========================================
// PAYMENT METHOD
// ==========================================

function getPaymentMethod() {

    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    return selected
        ? selected.value
        : "Cash on Delivery";

}


// ==========================================
// GET CUSTOMER INFORMATION
// ==========================================

function getCustomerInformation() {

    return {

        name:
            document
                .getElementById("customerName")
                .value
                .trim(),

        phone:
            document
                .getElementById("customerPhone")
                .value
                .trim(),

        email:
            document
                .getElementById("customerEmail")
                .value
                .trim(),

        city:
            document
                .getElementById("customerCity")
                .value
                .trim(),

        address:
            document
                .getElementById("customerAddress")
                .value
                .trim(),

        note:
            document
                .getElementById("customerNote")
                .value
                .trim()

    };

}


// ==========================================
// CREATE ORDER ITEMS
// ==========================================

function createOrderItems() {

    return cart.map(function(item) {

        return {

            id:
                item.id ||
                item.productId ||
                item.name,

            name:
                item.name ||
                "Unnamed Product",

            price:
                Number(item.price) || 0,

            quantity:
                Number(item.quantity) || 0

        };

    });

}


// ==========================================
// PLACE ORDER
// ==========================================

if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // ==================================
            // CHECK CART
            // ==================================

            if (
                !cart ||
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty. Please add a product first."
                );

                window.location.href =
                    "shop.html";

                return;

            }


            // ==================================
            // VALIDATE FORM
            // ==================================

            if (
                !checkoutForm.checkValidity()
            ) {

                checkoutForm.reportValidity();

                return;

            }


            // ==================================
            // GET CUSTOMER
            // ==================================

            const customer =
                getCustomerInformation();


            // ==================================
            // CALCULATE TOTAL
            // ==================================

            const total =
                cart.reduce(
                    function(sum, item) {

                        const price =
                            Number(item.price) || 0;

                        const quantity =
                            Number(item.quantity) || 0;


                        return (
                            sum +
                            (
                                price *
                                quantity
                            )
                        );

                    },
                    0
                );


            // ==================================
            // PAYMENT
            // ==================================

            const paymentMethod =
                getPaymentMethod();


            // ==================================
            // ORDER NUMBER
            // ==================================

            const generatedOrderNumber =
                generateOrderNumber();


            // ==================================
            // DISABLE BUTTON
            // ==================================

            const placeOrderButton =
                checkoutForm.querySelector(
                    'button[type="submit"]'
                );


            if (placeOrderButton) {

                placeOrderButton.disabled =
                    true;

                placeOrderButton.innerHTML = `

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Processing Order...

                `;

            }


            try {

                // ==================================
                // FIREBASE TRANSACTION
                // ==================================
                //
                // This transaction:
                //
                // 1. Checks product stock
                // 2. Reduces Firebase stock
                // 3. Creates Firebase order
                //
                // Everything happens together.
                //
                // ==================================

                const orderRef =
                    doc(
                        collection(
                            db,
                            "orders"
                        )
                    );


                await runTransaction(
                    db,
                    async function(transaction) {

                        const productRefs = [];


                        // ==================================
                        // READ ALL PRODUCTS FIRST
                        // ==================================

                        for (
                            const cartItem of cart
                        ) {

                            const productId =
                                cartItem.id ||
                                cartItem.productId;


                            if (!productId) {

                                throw new Error(
                                    `Product "${cartItem.name}" does not have a valid Firebase ID.`
                                );

                            }


                            const productRef =
                                doc(
                                    db,
                                    "products",
                                    String(
                                        productId
                                    )
                                );


                            const productSnapshot =
                                await transaction.get(
                                    productRef
                                );


                            if (
                                !productSnapshot.exists()
                            ) {

                                throw new Error(
                                    `Product "${cartItem.name}" no longer exists.`
                                );

                            }


                            const productData =
                                productSnapshot.data();


                            const currentStock =
                                Number(
                                    productData.stock ??
                                    productData.quantity ??
                                    0
                                );


                            const requestedQuantity =
                                Number(
                                    cartItem.quantity
                                ) || 0;


                            if (
                                requestedQuantity <= 0
                            ) {

                                throw new Error(
                                    `Invalid quantity for ${cartItem.name}.`
                                );

                            }


                            if (
                                currentStock <
                                requestedQuantity
                            ) {

                                throw new Error(
                                    `Not enough stock for "${cartItem.name}". Available: ${currentStock}.`
                                );

                            }


                            productRefs.push({

                                ref:
                                    productRef,

                                data:
                                    productData,

                                stock:
                                    currentStock,

                                quantity:
                                    requestedQuantity

                            });

                        }


                        // ==================================
                        // UPDATE PRODUCT STOCK
                        // ==================================

                        productRefs.forEach(
                            function(product) {

                                const newStock =
                                    Math.max(
                                        0,
                                        product.stock -
                                        product.quantity
                                    );


                                transaction.update(
                                    product.ref,
                                    {

                                        stock:
                                            newStock

                                    }
                                );

                            }
                        );


                        // ==================================
                        // CREATE FIREBASE ORDER
                        // ==================================

                        const order = {

                            id:
                                generatedOrderNumber,

                            customer:
                                customer,

                            items:
                                createOrderItems(),

                            total:
                                Number(
                                    total.toFixed(2)
                                ),

                            paymentMethod:
                                paymentMethod,

                            status:
                                "Pending",

                            date:
                                new Date().toISOString(),

                            createdAt:
                                new Date().toISOString()

                        };


                        transaction.set(
                            orderRef,
                            order
                        );

                    }
                );


                // ==================================
                // CLEAR CART
                // ==================================

                localStorage.removeItem(
                    "shoppingCart"
                );

                cart = [];


                // ==================================
                // SHOW ORDER NUMBER
                // ==================================

                if (orderNumber) {

                    orderNumber.textContent =
                        generatedOrderNumber;

                }


                // ==================================
                // SHOW SUCCESS MODAL
                // ==================================

                if (successModal) {

                    successModal.classList.add(
                        "show"
                    );

                }
                else {

                    alert(
                        `Order ${generatedOrderNumber} placed successfully!`
                    );

                    window.location.href =
                        "shop.html";

                }


                console.log(
                    "Order successfully created in Firebase:",
                    generatedOrderNumber
                );


            }
            catch (error) {

                console.error(
                    "ORDER ERROR:",
                    error
                );


                alert(
                    "The order could not be placed.\n\n" +
                    error.message
                );


                // ==================================
                // ENABLE BUTTON AGAIN
                // ==================================

                if (placeOrderButton) {

                    placeOrderButton.disabled =
                        false;

                    placeOrderButton.innerHTML = `

                        <i class="fa-solid fa-lock"></i>

                        Place Order

                    `;

                }

            }

        }
    );

}


// ==========================================
// ESCAPE HTML
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
// START
// ==========================================

displayCheckout();


// ==========================================
// DEBUG
// ==========================================

console.log(
    "BizManager Firebase Checkout Loaded"
);

console.log(
    "Shopping Cart:",
    cart
);
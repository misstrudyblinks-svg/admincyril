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

    if (!Array.isArray(cart)) {
        cart = [];
    }

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

    if (!checkoutItems) {
        return;
    }

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

    const getValue = function(id) {

        const element =
            document.getElementById(id);

        return element
            ? element.value.trim()
            : "";

    };


    return {

        name:
            getValue("customerName"),

        phone:
            getValue("customerPhone"),

        email:
            getValue("customerEmail"),

        city:
            getValue("customerCity"),

        address:
            getValue("customerAddress"),

        note:
            getValue("customerNote")

    };

}


// ==========================================
// CREATE BASIC ORDER ITEMS
// ==========================================
//
// Firebase stock and prices will be checked
// again during checkout.
// ==========================================

function createOrderItems(
    verifiedItems
) {

    return verifiedItems.map(function(item) {

        return {

            productId:
                item.productId,

            name:
                item.name,

            price:
                Number(
                    item.price
                ),

            quantity:
                Number(
                    item.quantity
                ),

            subtotal:
                Number(
                    (
                        item.price *
                        item.quantity
                    ).toFixed(2)
                )

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
            // CUSTOMER
            // ==================================

            const customer =
                getCustomerInformation();


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
            // BUTTON
            // ==================================

            const placeOrderButton =
                checkoutForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonHTML =
                placeOrderButton
                    ? placeOrderButton.innerHTML
                    : "";


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
                // FIRESTORE ORDER REFERENCE
                // ==================================

               const orderRef =
                            doc(
                               db,
                             "orders",
                             generatedOrderNumber
                             );

                // ==================================
                // VERIFIED ITEMS
                // ==================================

                let verifiedItems = [];


                let verifiedTotal = 0;


                // ==================================
                // FIREBASE TRANSACTION
                // ==================================

                await runTransaction(
                    db,
                    async function(transaction) {

                        const productsToUpdate = [];


                        // ==================================
                        // IMPORTANT:
                        // ALL PRODUCT READS HAPPEN FIRST
                        // ==================================

                        for (
                            const cartItem of cart
                        ) {

                            // ------------------------------
                            // FIREBASE PRODUCT ID
                            // ------------------------------

                            const productId =
                                cartItem.id ||
                                cartItem.productId;


                            if (!productId) {

                                throw new Error(
                                    `Product "${cartItem.name || "Unknown"}" does not have a valid Firebase ID.`
                                );

                            }


                            // ------------------------------
                            // QUANTITY
                            // ------------------------------

                            const requestedQuantity =
                                Number(
                                    cartItem.quantity
                                );


                            if (
                                !Number.isInteger(
                                    requestedQuantity
                                ) ||
                                requestedQuantity <= 0
                            ) {

                                throw new Error(
                                    `Invalid quantity for "${cartItem.name || "product"}".`
                                );

                            }


                            // ------------------------------
                            // FIREBASE PRODUCT REFERENCE
                            // ------------------------------

                            const productRef =
                                doc(
                                    db,
                                    "products",
                                    String(
                                        productId
                                    )
                                );


                            // ------------------------------
                            // GET CURRENT FIREBASE PRODUCT
                            // ------------------------------

                            const productSnapshot =
                                await transaction.get(
                                    productRef
                                );


                            if (
                                !productSnapshot.exists()
                            ) {

                                throw new Error(
                                    `Product "${cartItem.name || "Unknown"}" no longer exists.`
                                );

                            }


                            const productData =
                                productSnapshot.data();


                            // ------------------------------
                            // CURRENT FIREBASE STOCK
                            // ------------------------------

                            const currentStock =
                                Number(
                                    productData.stock ??
                                    productData.quantity ??
                                    0
                                );


                            if (
                                currentStock < 0
                            ) {

                                throw new Error(
                                    `Invalid stock value for "${productData.name || cartItem.name}".`
                                );

                            }


                            // ------------------------------
                            // CHECK STOCK
                            // ------------------------------

                            if (
                                requestedQuantity >
                                currentStock
                            ) {

                                throw new Error(
                                    `Not enough stock for "${productData.name || cartItem.name}". Available: ${currentStock}, requested: ${requestedQuantity}.`
                                );

                            }


                            // ------------------------------
                            // FIREBASE PRICE
                            // ------------------------------
                            //
                            // IMPORTANT:
                            // Do NOT trust the price stored
                            // in localStorage.
                            //
                            // The current Firebase price
                            // is used.
                            // ------------------------------

                            const currentPrice =
                                Number(
                                    productData.price ??
                                    productData.sellingPrice ??
                                    0
                                );


                            if (
                                currentPrice < 0 ||
                                Number.isNaN(
                                    currentPrice
                                )
                            ) {

                                throw new Error(
                                    `Invalid price for "${productData.name || cartItem.name}".`
                                );

                            }


                            // ------------------------------
                            // PRODUCT NAME
                            // ------------------------------

                            const productName =
                                productData.name ||
                                productData.productName ||
                                cartItem.name ||
                                "Unnamed Product";


                            // ------------------------------
                            // NEW STOCK
                            // ------------------------------

                            const newStock =
                                currentStock -
                                requestedQuantity;


                            // ------------------------------
                            // STORE UPDATE
                            // ------------------------------

                            productsToUpdate.push({

                                ref:
                                    productRef,

                                newStock:
                                    newStock

                            });


                            // ------------------------------
                            // ORDER ITEM
                            // ------------------------------

                            const subtotal =
                                Number(
                                    (
                                        currentPrice *
                                        requestedQuantity
                                    ).toFixed(2)
                                );


                            verifiedItems.push({

                                productId:
                                    String(
                                        productId
                                    ),

                                name:
                                    productName,

                                price:
                                    currentPrice,

                                quantity:
                                    requestedQuantity

                            });


                            verifiedTotal +=
                                subtotal;

                        }


                        // ==================================
                        // UPDATE STOCK
                        // ==================================

                        productsToUpdate.forEach(
                            function(product) {

                                transaction.update(
                                    product.ref,
                                    {

                                        stock:
                                            product.newStock,

                                        // Keep quantity synchronized
                                        quantity:
                                            product.newStock

                                    }
                                );

                            }
                        );


                        // ==================================
                        // CREATE ORDER
                        // ==================================

                        const order = {

                            id:
                                generatedOrderNumber,

                            orderNumber:
                                generatedOrderNumber,

                            customer:
                                customer,

                            items:
                                createOrderItems(
                                    verifiedItems
                                ),

                            total:
                                Number(
                                    verifiedTotal.toFixed(2)
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


                        // ==================================
                        // SAVE ORDER
                        // ==================================

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
                // SUCCESS MODAL
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

            catch(error) {

                console.error(
                    "ORDER ERROR:",
                    error
                );


                let message =
                    error.message ||
                    "Unknown error occurred.";


                // ==================================
                // FIREBASE PERMISSION ERROR
                // ==================================

                if (
                    error.code ===
                    "permission-denied"
                ) {

                    message =
                        "Firebase permission denied. Please check your Firestore security rules.";

                }


                alert(
                    "The order could not be placed.\n\n" +
                    message
                );


                // ==================================
                // ENABLE BUTTON
                // ==================================

                if (placeOrderButton) {

                    placeOrderButton.disabled =
                        false;

                    placeOrderButton.innerHTML =
                        originalButtonHTML ||
                        `

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
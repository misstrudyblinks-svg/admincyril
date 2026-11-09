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
// PAYMENT DETAILS
// ==========================================

function getPaymentDetails() {

    const paymentMethod =
        getPaymentMethod();


    // ======================================
    // CASH ON DELIVERY
    // ======================================

    if (
        paymentMethod ===
        "Cash on Delivery"
    ) {

        return {

            method:
                "Cash on Delivery"

        };

    }


    // ======================================
    // MOBILE MONEY
    // ======================================

    if (
        paymentMethod ===
        "Mobile Money"
    ) {

        const momoName =
            document.getElementById(
                "momoName"
            );

        const momoNumber =
            document.getElementById(
                "momoNumber"
            );

        const momoNetwork =
            document.getElementById(
                "momoNetwork"
            );


        return {

            method:
                "Mobile Money",

            name:
                momoName
                    ? momoName.value.trim()
                    : "",

            phone:
                momoNumber
                    ? momoNumber.value.trim()
                    : "",

            network:
                momoNetwork
                    ? momoNetwork.value
                    : ""

        };

    }


    // ======================================
    // BANK TRANSFER
    // ======================================

    if (
        paymentMethod ===
        "Bank Transfer"
    ) {

        const bankName =
            document.getElementById(
                "bankName"
            );

        const accountName =
            document.getElementById(
                "accountName"
            );

        const accountNumber =
            document.getElementById(
                "accountNumber"
            );

        const transferReference =
            document.getElementById(
                "transferReference"
            );


        return {

            method:
                "Bank Transfer",

            bankName:
                bankName
                    ? bankName.value.trim()
                    : "",

            accountName:
                accountName
                    ? accountName.value.trim()
                    : "",

            accountNumber:
                accountNumber
                    ? accountNumber.value.trim()
                    : "",

            transferReference:
                transferReference
                    ? transferReference.value.trim()
                    : ""

        };

    }


    return {};

}


// ==========================================
// GET CUSTOMER INFORMATION
// ==========================================

function getCustomerInformation() {

    function getValue(id) {

        const element =
            document.getElementById(id);

        return element
            ? element.value.trim()
            : "";

    }


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
// CREATE ORDER ITEMS
// ==========================================

function createOrderItems(
    verifiedItems
) {

    return verifiedItems.map(
        function(item) {

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

        }
    );

}


// ==========================================
// PAYMENT FORM DISPLAY
// ==========================================

function setupPaymentForms() {

    const paymentInputs =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    if (!paymentInputs.length) {
        return;
    }


    // ======================================
    // CREATE MOBILE MONEY FORM
    // ======================================

    const mobileMoneyForm =
        document.createElement("div");

    mobileMoneyForm.id =
        "mobileMoneyForm";

    mobileMoneyForm.style.display =
        "none";

    mobileMoneyForm.innerHTML = `

        <div class="payment-details-box">

            <h4>
                Mobile Money Information
            </h4>

            <p>
                Enter the Mobile Money details you will use for payment.
            </p>


            <div class="checkout-form-grid">

                <div class="form-group">

                    <label>
                        Account Name *
                    </label>

                    <input
                        type="text"
                        id="momoName"
                        placeholder="Enter Mobile Money account name">

                </div>


                <div class="form-group">

                    <label>
                        Mobile Money Number *
                    </label>

                    <input
                        type="tel"
                        id="momoNumber"
                        placeholder="e.g. 024 000 0000">

                </div>


                <div class="form-group">

                    <label>
                        Network *
                    </label>

                    <select id="momoNetwork">

                        <option value="">
                            Select network
                        </option>

                        <option value="MTN">
                            MTN Mobile Money
                        </option>

                        <option value="Telecel">
                            Telecel Cash
                        </option>

                        <option value="AirtelTigo">
                            AirtelTigo Money
                        </option>

                    </select>

                </div>

            </div>

        </div>

    `;


    // ======================================
    // CREATE BANK FORM
    // ======================================

    const bankTransferForm =
        document.createElement("div");

    bankTransferForm.id =
        "bankTransferForm";

    bankTransferForm.style.display =
        "none";

    bankTransferForm.innerHTML = `

        <div class="payment-details-box">

            <h4>
                Bank Transfer Information
            </h4>

            <p>
                Enter the bank details you will use for payment.
            </p>


            <div class="checkout-form-grid">

                <div class="form-group">

                    <label>
                        Bank Name *
                    </label>

                    <input
                        type="text"
                        id="bankName"
                        placeholder="Enter bank name">

                </div>


                <div class="form-group">

                    <label>
                        Account Name *
                    </label>

                    <input
                        type="text"
                        id="accountName"
                        placeholder="Enter account name">

                </div>


                <div class="form-group">

                    <label>
                        Account Number *
                    </label>

                    <input
                        type="text"
                        id="accountNumber"
                        placeholder="Enter account number">

                </div>


                <div class="form-group">

                    <label>
                        Transfer Reference
                    </label>

                    <input
                        type="text"
                        id="transferReference"
                        placeholder="Enter transfer reference">

                </div>

            </div>

        </div>

    `;


    // ======================================
    // FIND PAYMENT SECTION
    // ======================================

    const paymentSection =
        document.querySelector(
            ".payment-options"
        );


    if (!paymentSection) {
        return;
    }


    // Insert forms after payment options

    paymentSection.parentNode.insertBefore(
        mobileMoneyForm,
        paymentSection.nextSibling
    );


    paymentSection.parentNode.insertBefore(
        bankTransferForm,
        mobileMoneyForm.nextSibling
    );


    // ======================================
    // PAYMENT CHANGE
    // ======================================

    paymentInputs.forEach(
        function(input) {

            input.addEventListener(
                "change",
                function() {

                    mobileMoneyForm.style.display =
                        "none";

                    bankTransferForm.style.display =
                        "none";


                    // Remove required

                    document
                        .querySelectorAll(
                            "#mobileMoneyForm input, #mobileMoneyForm select, #bankTransferForm input, #bankTransferForm select"
                        )
                        .forEach(
                            function(field) {

                                field.required =
                                    false;

                            }
                        );


                    // MOBILE MONEY

                    if (
                        this.value ===
                        "Mobile Money"
                    ) {

                        mobileMoneyForm.style.display =
                            "block";


                        document
                            .querySelectorAll(
                                "#mobileMoneyForm input, #mobileMoneyForm select"
                            )
                            .forEach(
                                function(field) {

                                    field.required =
                                        true;

                                }
                            );

                    }


                    // BANK TRANSFER

                    if (
                        this.value ===
                        "Bank Transfer"
                    ) {

                        bankTransferForm.style.display =
                            "block";


                        document
                            .querySelectorAll(
                                "#bankTransferForm input"
                            )
                            .forEach(
                                function(field) {

                                    field.required =
                                        true;

                                }
                            );

                        // Reference is optional

                        const reference =
                            document.getElementById(
                                "transferReference"
                            );

                        if (reference) {

                            reference.required =
                                false;

                        }

                    }

                }
            );

        }
    );

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


            const paymentDetails =
                getPaymentDetails();


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
                // PAYSTACK ONLINE CHECKOUT
                // ==================================
                // Deploy the backend first, then replace this URL with its HTTPS URL.
                if (paymentMethod === "Paystack") {

                    const PAYSTACK_BACKEND_URL = "https://YOUR-BACKEND-DOMAIN.example.com";

                    if (PAYSTACK_BACKEND_URL.includes("YOUR-BACKEND-DOMAIN")) {
                        throw new Error("Paystack backend is not configured yet. Follow PAYSTACK_SETUP.md and add your deployed backend URL to checkout.js.");
                    }

                    if (!customer.email) {
                        throw new Error("Please enter your email address to continue with Paystack.");
                    }

                    const response = await fetch(`${PAYSTACK_BACKEND_URL}/api/paystack/initialize`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            customer,
                            items: cart.map(item => ({
                                productId: String(item.id || item.productId || ""),
                                quantity: Number(item.quantity)
                            }))
                        })
                    });

                    const result = await response.json().catch(() => ({}));
                    if (!response.ok || !result.authorization_url) {
                        throw new Error(result.error || "Could not start Paystack checkout.");
                    }

                    window.location.assign(result.authorization_url);
                    return;
                }

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
                        // READ PRODUCTS FIRST
                        // ==================================

                        for (
                            const cartItem of cart
                        ) {

                            const productId =
                                cartItem.id ||
                                cartItem.productId;


                            if (!productId) {

                                throw new Error(
                                    `Product "${cartItem.name || "Unknown"}" does not have a valid Firebase ID.`
                                );

                            }


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
                                    `Product "${cartItem.name || "Unknown"}" no longer exists.`
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


                            if (
                                currentStock < 0
                            ) {

                                throw new Error(
                                    `Invalid stock value for "${productData.name || cartItem.name}".`
                                );

                            }


                            if (
                                requestedQuantity >
                                currentStock
                            ) {

                                throw new Error(
                                    `Not enough stock for "${productData.name || cartItem.name}". Available: ${currentStock}, requested: ${requestedQuantity}.`
                                );

                            }


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


                            const productName =
                                productData.name ||
                                productData.productName ||
                                cartItem.name ||
                                "Unnamed Product";


                            const newStock =
                                currentStock -
                                requestedQuantity;


                            productsToUpdate.push({

                                ref:
                                    productRef,

                                newStock:
                                    newStock

                            });


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

                            paymentDetails:
                                paymentDetails,

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
// PAYSTACK CALLBACK UI
// The backend redirects here only after server-side verification.
// ==========================================
(function handlePaystackReturn() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") !== "success") return;

    const reference = params.get("order") || params.get("reference") || "";
    localStorage.removeItem("shoppingCart");
    cart = [];

    if (orderNumber) orderNumber.textContent = reference || "Payment confirmed";
    if (successModal) successModal.classList.add("show");
    else alert(`Paystack payment verified. Order: ${reference}`);

    // Remove callback parameters from the address bar after rendering.
    window.history.replaceState({}, document.title, window.location.pathname);
})();


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

setupPaymentForms();


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
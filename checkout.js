// ==========================================
// BIZMANAGER CHECKOUT
// ==========================================


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


// ==========================================
// CHECK CART
// ==========================================

if (cart.length === 0) {

    alert(
        "Your cart is empty. Please add a product first."
    );

    window.location.href =
        "shop.html";

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
                        src="${item.image}"
                        alt="${item.name || "Product"}">
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
                    ${item.name || "Unnamed Product"}
                </h4>

                <span>
                    Quantity: ${itemQuantity}
                </span>

                <strong>
                    GH₵${itemTotal.toFixed(2)}
                </strong>

            </div>

        `;


        checkoutItems.appendChild(
            element
        );

    });


    checkoutSubtotal.textContent =
        `GH₵${total.toFixed(2)}`;


    checkoutTotal.textContent =
        `GH₵${total.toFixed(2)}`;


    summaryCount.textContent =
        `${quantity} item${
            quantity === 1
                ? ""
                : "s"
        }`;

}


// ==========================================
// GENERATE ORDER NUMBER
// ==========================================

function generateOrderNumber() {

    const timestamp =
        Date.now()
            .toString()
            .slice(-6);


    return `ORD-${timestamp}`;

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
// CREATE SMALL ORDER ITEMS
// ==========================================
//
// IMPORTANT:
// We DO NOT save the Base64 image inside
// the order. This prevents localStorage
// from becoming too large.
//
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
        function(event) {

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
            // CREATE ORDER
            // ==================================

            const order = {

                id:
                    generateOrderNumber(),

                date:
                    new Date().toISOString(),

                customer:
                    customer,

                // IMPORTANT:
                // No images are saved here.
                items:
                    createOrderItems(),

                total:
                    total,

                paymentMethod:
                    getPaymentMethod(),

                status:
                    "Pending"

            };


            // ==================================
            // LOAD ORDERS
            // ==================================

            let orders = [];


            try {

                orders =
                    JSON.parse(
                        localStorage.getItem(
                            "orders"
                        )
                    ) || [];

            }
            catch (error) {

                console.error(
                    "Could not read existing orders:",
                    error
                );

                orders = [];

            }


            // ==================================
            // SAVE ORDER
            // ==========================================

            try {

                orders.push(
                    order
                );


                localStorage.setItem(
                    "orders",
                    JSON.stringify(
                        orders
                    )
                );

            }
            catch (error) {

                console.error(
                    "ORDER SAVE ERROR:",
                    error
                );


                alert(
                    "The order could not be saved. Your product images may have filled the browser storage."
                );


                return;

            }


            // ==================================
            // UPDATE PRODUCT STOCK
            // ==================================

            updateProductStock();


            // ==================================
            // CLEAR SHOPPING CART
            // ==================================

            localStorage.removeItem(
                "shoppingCart"
            );


            cart = [];


            // ==================================
            // SHOW ORDER NUMBER
            // ==================================

            const orderNumber =
                document.getElementById(
                    "orderNumber"
                );


            if (orderNumber) {

                orderNumber.textContent =
                    order.id;

            }


            // ==================================
            // SHOW SUCCESS MODAL
            // ==================================

            const successModal =
                document.getElementById(
                    "orderSuccess"
                );


            if (successModal) {

                successModal.classList.add(
                    "show"
                );

            }
            else {

                alert(
                    `Order ${order.id} placed successfully!`
                );

                window.location.href =
                    "shop.html";

            }

        }
    );

}


// ==========================================
// UPDATE PRODUCT STOCK
// ==========================================

function updateProductStock() {

    let products = [];


    try {

        products =
            JSON.parse(
                localStorage.getItem(
                    "products"
                )
            ) || [];

    }
    catch (error) {

        console.error(
            "Could not load products:",
            error
        );

        return;

    }


    cart.forEach(function(cartItem) {

        const cartId =
            String(
                cartItem.id ||
                cartItem.productId ||
                cartItem.name ||
                ""
            );


        const product =
            products.find(function(product) {

                const productId =
                    String(
                        product.id ||
                        product.productId ||
                        product.name ||
                        product.productName ||
                        ""
                    );


                return (
                    productId === cartId
                );

            });


        if (!product) {

            console.warn(
                "Product not found:",
                cartItem
            );

            return;

        }


        // ==================================
        // CURRENT STOCK
        // ==================================

        const currentStock =
            Number(
                product.stock ??
                product.quantity ??
                0
            );


        // ==================================
        // QUANTITY SOLD
        // ==================================

        const quantitySold =
            Number(
                cartItem.quantity
            ) || 0;


        // ==================================
        // NEW STOCK
        // ==================================

        const newStock =
            Math.max(
                0,
                currentStock -
                quantitySold
            );


        // Your products.js uses "stock"

        product.stock =
            newStock;

    });


    // ==================================
    // SAVE UPDATED PRODUCTS
    // ==================================

    try {

        localStorage.setItem(
            "products",
            JSON.stringify(
                products
            )
        );

    }
    catch (error) {

        console.error(
            "Could not update product stock:",
            error
        );

    }

}


// ==========================================
// START
// ==========================================

displayCheckout();


// ==========================================
// DEBUG
// ==========================================

console.log(
    "BizManager Checkout Loaded Successfully"
);

console.log(
    "Cart:",
    cart
);
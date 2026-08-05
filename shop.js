// ==========================================
// BIZMANAGER CUSTOMER SHOP
// FIREBASE VERSION
// ==========================================

import {
    db
} from "./firebase-config.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// PRODUCTS
// ==========================================

let products = [];


// ==========================================
// CART
// ==========================================

let cart =
    JSON.parse(
        localStorage.getItem("shoppingCart")
    ) || [];


// ==========================================
// ELEMENTS
// ==========================================

const productGrid =
    document.getElementById("shopProductGrid");

const emptyProducts =
    document.getElementById("shopEmpty");

const searchInput =
    document.getElementById("shopSearch");

const categoryFilter =
    document.getElementById("categoryFilter");

const categoryButtons =
    document.getElementById("categoryButtons");

const productResultCount =
    document.getElementById("productResultCount");


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
// GET PRICE
// ==========================================

function getProductPrice(product) {

    return Number(
        product.price ??
        product.sellingPrice ??
        0
    );

}


// ==========================================
// GET STOCK
// ==========================================

function getProductStock(product) {

    return Number(
        product.stock ??
        product.quantity ??
        0
    );

}


// ==========================================
// GET CATEGORY
// ==========================================

function getProductCategory(product) {

    return (
        product.category ||
        "Other"
    );

}


// ==========================================
// GET IMAGE
// ==========================================

function getProductImage(product) {

    return (
        product.image ||
        product.imageUrl ||
        product.photo ||
        ""
    );

}


// ==========================================
// GET DESCRIPTION
// ==========================================

function getProductDescription(product) {

    return (
        product.description ||
        "Quality product available from our store."
    );

}


// ==========================================
// LOAD PRODUCTS FROM FIREBASE
// ==========================================

function loadProductsFromFirebase() {

    const productsRef =
        collection(
            db,
            "products"
        );


    onSnapshot(
        productsRef,

        snapshot => {

            products =
                snapshot.docs.map(
                    doc => ({

                        id: doc.id,

                        ...doc.data()

                    })
                );


            console.log(
                "Products loaded from Firebase:",
                products
            );


            loadCategories();

            renderProducts();

        },

        error => {

            console.error(
                "Firebase product loading error:",
                error
            );


            productGrid.innerHTML = "";


            emptyProducts.style.display =
                "block";


            productResultCount.textContent =
                "0 Products";


            alert(
                "Products could not be loaded.\n\n" +
                error.message
            );

        }
    );

}


// ==========================================
// LOAD CATEGORIES
// ==========================================

function loadCategories() {

    const categories = [
        ...new Set(
            products.map(
                product =>
                    getProductCategory(product)
            )
        )
    ];


    categoryButtons.innerHTML = "";


    // Reset select

    categoryFilter.innerHTML = `

        <option value="all">
            All Categories
        </option>

    `;


    categories.forEach(
        category => {

            // ------------------------------
            // CATEGORY BUTTON
            // ------------------------------

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-btn";


            button.dataset.category =
                category;


            button.innerHTML = `

                <i class="fa-solid fa-tag"></i>

                ${escapeHTML(category)}

            `;


            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".category-btn"
                        )
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );


                    this.classList.add(
                        "active"
                    );


                    categoryFilter.value =
                        category;


                    renderProducts();

                }
            );


            categoryButtons.appendChild(
                button
            );


            // ------------------------------
            // CATEGORY SELECT OPTION
            // ------------------------------

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            categoryFilter.appendChild(
                option
            );

        }
    );

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function renderProducts() {

    if (
        !productGrid ||
        !searchInput ||
        !categoryFilter
    ) {

        return;

    }


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const category =
        categoryFilter.value;


    const filtered =
        products.filter(
            product => {

                const name =
                    getProductName(
                        product
                    )
                    .toLowerCase();


                const productCategory =
                    getProductCategory(
                        product
                    );


                const matchesSearch =
                    name.includes(
                        search
                    );


                const matchesCategory =
                    category === "all" ||
                    productCategory ===
                    category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    productGrid.innerHTML = "";


    productResultCount.textContent =
        `${filtered.length} Product${
            filtered.length === 1
                ? ""
                : "s"
        }`;


    if (
        filtered.length === 0
    ) {

        emptyProducts.style.display =
            "block";

        return;

    }


    emptyProducts.style.display =
        "none";


    filtered.forEach(
        product => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "shop-product-card";


            const stock =
                getProductStock(
                    product
                );


            const image =
                getProductImage(
                    product
                );


            const name =
                getProductName(
                    product
                );


            const category =
                getProductCategory(
                    product
                );


            const price =
                getProductPrice(
                    product
                );


            const description =
                getProductDescription(
                    product
                );


            // ------------------------------
            // PRODUCT IMAGE
            // ------------------------------

            const imageHTML =
                image

                    ? `

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}">

                    `

                    : `

                        <i class="fa-solid fa-box"></i>

                    `;


            // ------------------------------
            // PRODUCT CARD
            // ------------------------------

            card.innerHTML = `

                <div class="shop-product-image">

                    ${imageHTML}

                    <span
                        class="stock-badge ${
                            stock <= 0
                                ? "out"
                                : ""
                        }">

                        ${
                            stock <= 0
                                ? "Out of Stock"
                                : `${stock} Available`
                        }

                    </span>

                </div>


                <div class="shop-product-info">

                    <span class="shop-product-category">

                        ${escapeHTML(category)}

                    </span>


                    <h3>

                        ${escapeHTML(name)}

                    </h3>


                    <p class="shop-product-description">

                        ${escapeHTML(description)}

                    </p>


                    <div class="shop-product-bottom">

                        <span class="shop-price">

                            GH₵${price.toFixed(2)}

                        </span>


                        <button
                            class="add-cart-btn"
                            title="Add to Cart"
                            ${
                                stock <= 0
                                    ? "disabled"
                                    : ""
                            }>

                            <i class="fa-solid fa-cart-plus"></i>

                        </button>

                    </div>

                </div>

            `;


            // ------------------------------
            // OPEN PRODUCT DETAILS
            // ------------------------------

            card
                .querySelector(
                    ".shop-product-image"
                )
                .addEventListener(
                    "click",
                    () =>
                        showProduct(
                            product
                        )
                );


            // ------------------------------
            // ADD TO CART
            // ------------------------------

            const addButton =
                card.querySelector(
                    ".add-cart-btn"
                );


            if (addButton) {

                addButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        addToCart(
                            product
                        );

                    }
                );

            }


            productGrid.appendChild(
                card
            );

        }
    );

}


// ==========================================
// ADD TO CART
// ==========================================

function addToCart(product) {

    const productId =
        product.id ||
        product.productId ||
        getProductName(product);


    const stock =
        getProductStock(
            product
        );


    if (stock <= 0) {

        alert(
            "This product is out of stock."
        );

        return;

    }


    const existing =
        cart.find(
            item =>
                item.id === productId
        );


    if (existing) {

        if (
            existing.quantity >=
            stock
        ) {

            alert(
                "You cannot add more than the available stock."
            );

            return;

        }


        existing.quantity++;

        // Keep latest stock

        existing.stock =
            stock;

    }

    else {

        cart.push({

            id:
                productId,

            name:
                getProductName(
                    product
                ),

            price:
                getProductPrice(
                    product
                ),

            image:
                getProductImage(
                    product
                ),

            quantity:
                1,

            stock:
                stock

        });

    }


    saveCart();

    updateCart();

    openCart();

}


// ==========================================
// SAVE CART
// ==========================================

function saveCart() {

    localStorage.setItem(
        "shoppingCart",
        JSON.stringify(cart)
    );

}


// ==========================================
// CHECKOUT
// ==========================================

const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );


if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        function () {

            if (
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            window.location.href =
                "checkout.html";

        }
    );

}


// ==========================================
// UPDATE CART
// ==========================================

function updateCart() {

    const cartItems =
        document.getElementById(
            "cartItems"
        );

    const cartEmpty =
        document.getElementById(
            "cartEmpty"
        );

    const cartFooter =
        document.getElementById(
            "cartFooter"
        );


    if (!cartItems) return;


    cartItems.innerHTML = "";


    const totalQuantity =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                Number(
                    item.quantity
                ),
            0
        );


    const totalPrice =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                (
                    Number(
                        item.price
                    ) *
                    Number(
                        item.quantity
                    )
                ),
            0
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    const cartItemsText =
        document.getElementById(
            "cartItemsText"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    if (cartCount) {

        cartCount.textContent =
            totalQuantity;

    }


    if (cartItemsText) {

        cartItemsText.textContent =
            `${totalQuantity} item${
                totalQuantity === 1
                    ? ""
                    : "s"
            }`;

    }


    if (cartTotal) {

        cartTotal.textContent =
            `GH₵${totalPrice.toFixed(2)}`;

    }


    if (
        cart.length === 0
    ) {

        cartEmpty.style.display =
            "block";

        cartFooter.style.display =
            "none";

        return;

    }


    cartEmpty.style.display =
        "none";

    cartFooter.style.display =
        "block";


    cart.forEach(
        (item, index) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "cart-item";


            const image =
                item.image

                    ? `

                        <img
                            src="${escapeHTML(item.image)}"
                            alt="${escapeHTML(item.name)}">

                    `

                    : `

                        <i class="fa-solid fa-box"></i>

                    `;


            element.innerHTML = `

                <div class="cart-item-image">

                    ${image}

                </div>


                <div class="cart-item-info">

                    <h4>
                        ${escapeHTML(item.name)}
                    </h4>


                    <strong>
                        GH₵${Number(item.price).toFixed(2)}
                    </strong>


                    <div class="cart-quantity">

                        <button
                            onclick="changeQuantity(${index}, -1)">

                            <i class="fa-solid fa-minus"></i>

                        </button>


                        <span>
                            ${item.quantity}
                        </span>


                        <button
                            onclick="changeQuantity(${index}, 1)">

                            <i class="fa-solid fa-plus"></i>

                        </button>


                        <button
                            class="remove-cart"
                            onclick="removeFromCart(${index})">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </div>

            `;


            cartItems.appendChild(
                element
            );

        }
    );

}


// ==========================================
// CHANGE QUANTITY
// ==========================================

window.changeQuantity =
function (
    index,
    change
) {

    const item =
        cart[index];


    if (!item) return;


    const newQuantity =
        Number(item.quantity) +
        Number(change);


    if (
        newQuantity <= 0
    ) {

        cart.splice(
            index,
            1
        );

    }

    else if (
        newQuantity >
        Number(item.stock)
    ) {

        alert(
            "You have reached the available stock."
        );

        return;

    }

    else {

        item.quantity =
            newQuantity;

    }


    saveCart();

    updateCart();

};


// ==========================================
// REMOVE FROM CART
// ==========================================

window.removeFromCart =
function (
    index
) {

    cart.splice(
        index,
        1
    );


    saveCart();

    updateCart();

};


// ==========================================
// OPEN CART
// ==========================================

function openCart() {

    document
        .getElementById(
            "cartDrawer"
        )
        .classList.add(
            "show"
        );


    document
        .getElementById(
            "cartOverlay"
        )
        .classList.add(
            "show"
        );

}


// ==========================================
// CLOSE CART
// ==========================================

function closeCart() {

    document
        .getElementById(
            "cartDrawer"
        )
        .classList.remove(
            "show"
        );


    document
        .getElementById(
            "cartOverlay"
        )
        .classList.remove(
            "show"
        );

}


// ==========================================
// CART BUTTONS
// ==========================================

document
    .getElementById(
        "cartButton"
    )
    .addEventListener(
        "click",
        openCart
    );


document
    .getElementById(
        "closeCart"
    )
    .addEventListener(
        "click",
        closeCart
    );


document
    .getElementById(
        "cartOverlay"
    )
    .addEventListener(
        "click",
        closeCart
    );


// ==========================================
// PRODUCT DETAILS
// ==========================================

function showProduct(product) {

    const modal =
        document.getElementById(
            "productModal"
        );


    const content =
        document.getElementById(
            "productModalContent"
        );


    const image =
        getProductImage(
            product
        );


    const name =
        getProductName(
            product
        );


    const category =
        getProductCategory(
            product
        );


    const description =
        getProductDescription(
            product
        );


    const price =
        getProductPrice(
            product
        );


    const stock =
        getProductStock(
            product
        );


    const productId =
        product.id ||
        product.productId ||
        name;


    content.innerHTML = `

        <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:30px;
            align-items:center;
        ">

            <div
                class="shop-product-image"
                style="
                    height:350px;
                    border-radius:15px;
                ">

                ${
                    image

                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}">
                    `

                    : `
                        <i class="fa-solid fa-box"></i>
                    `
                }

            </div>


            <div>

                <span class="shop-product-category">

                    ${escapeHTML(category)}

                </span>


                <h2 style="margin:10px 0;">

                    ${escapeHTML(name)}

                </h2>


                <p style="
                    color:#6b7280;
                    line-height:1.7;
                    font-size:13px;
                ">

                    ${escapeHTML(description)}

                </p>


                <h2>

                    GH₵${price.toFixed(2)}

                </h2>


                <p style="font-size:11px;">

                    ${
                        stock > 0
                            ? `${stock} items available`
                            : "Out of stock"
                    }

                </p>


                <button
                    class="checkout-btn"
                    id="modalAddToCart"
                    ${
                        stock <= 0
                            ? "disabled"
                            : ""
                    }>

                    <i class="fa-solid fa-cart-plus"></i>

                    Add to Cart

                </button>

            </div>

        </div>

    `;


    const modalAddToCart =
        document.getElementById(
            "modalAddToCart"
        );


    if (modalAddToCart) {

        modalAddToCart.addEventListener(
            "click",
            function () {

                addToCart(
                    product
                );

            }
        );

    }


    modal.classList.add(
        "show"
    );

}


// ==========================================
// CLOSE PRODUCT MODAL
// ==========================================

document
    .getElementById(
        "closeProductModal"
    )
    .addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "productModal"
                )
                .classList.remove(
                    "show"
                );

        }
    );


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    renderProducts
);


// ==========================================
// CATEGORY FILTER
// ==========================================

categoryFilter.addEventListener(
    "change",
    function () {

        document
            .querySelectorAll(
                ".category-btn"
            )
            .forEach(
                btn =>
                    btn.classList.remove(
                        "active"
                    )
            );


        if (
            this.value === "all"
        ) {

            const allButton =
                document.querySelector(
                    '.category-btn[data-category="all"]'
                );


            if (allButton) {

                allButton.classList.add(
                    "active"
                );

            }

        }

        else {

            const selected =
                document.querySelector(
                    `[data-category="${CSS.escape(this.value)}"]`
                );


            if (selected) {

                selected.classList.add(
                    "active"
                );

            }

        }


        renderProducts();

    }
);


// ==========================================
// HTML ESCAPE
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
// START SHOP
// ==========================================

updateCart();

loadProductsFromFirebase();
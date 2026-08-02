// ==========================================
// BIZMANAGER CUSTOMER SHOP
// ==========================================


// ==========================================
// LOAD PRODUCTS
// ==========================================

let products =
    JSON.parse(
        localStorage.getItem("products")
    ) || [];


// ==========================================
// LOAD CART
// ==========================================

let cart =
    JSON.parse(
        localStorage.getItem("shoppingCart")
    ) || [];


// ==========================================
// ELEMENTS
// ==========================================

const productGrid =
    document.getElementById(
        "shopProductGrid"
    );

const emptyProducts =
    document.getElementById(
        "shopEmpty"
    );

const searchInput =
    document.getElementById(
        "shopSearch"
    );

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );

const categoryButtons =
    document.getElementById(
        "categoryButtons"
    );

const productResultCount =
    document.getElementById(
        "productResultCount"
    );


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
        product.price ||
        product.sellingPrice ||
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
// CATEGORIES
// ==========================================

function loadCategories() {

    const categories =
        [
            ...new Set(
                products.map(
                    product =>
                        getProductCategory(
                            product
                        )
                )
            )
        ];


    categoryButtons.innerHTML = "";


    categories.forEach(
        category => {

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

                ${category}

            `;


            button.addEventListener(
                "click",
                function() {

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
                    ).toLowerCase();


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


            const imageHTML =
                image

                    ? `

                        <img
                            src="${image}"
                            alt="${getProductName(product)}">

                    `

                    : `

                        <i class="fa-solid fa-box"></i>

                    `;


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

                        ${getProductCategory(product)}

                    </span>


                    <h3>

                        ${getProductName(product)}

                    </h3>


                    <p class="shop-product-description">

                        ${getProductDescription(product)}

                    </p>


                    <div class="shop-product-bottom">

                        <span class="shop-price">

                            GH₵${getProductPrice(product).toFixed(2)}

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


    const existing =
        cart.find(
            item =>
                item.id === productId
        );


    if (
        existing
    ) {

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

    }

    else {

        cart.push({

            id: productId,

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

            quantity: 1,

            stock: stock

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


document.getElementById(
    "checkoutButton"
).addEventListener(
    "click",
    function() {

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


    cartItems.innerHTML = "";


    const totalQuantity =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                item.quantity,
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
                    item.price *
                    item.quantity
                ),
            0
        );


    document.getElementById(
        "cartCount"
    ).textContent =
        totalQuantity;


    document.getElementById(
        "cartItemsText"
    ).textContent =
        `${totalQuantity} item${
            totalQuantity === 1
                ? ""
                : "s"
        }`;


    document.getElementById(
        "cartTotal"
    ).textContent =
        `GH₵${totalPrice.toFixed(2)}`;


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
                            src="${item.image}"
                            alt="${item.name}">

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
                        ${item.name}
                    </h4>


                    <strong>
                        GH₵${item.price.toFixed(2)}
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

function changeQuantity(
    index,
    change
) {

    const item =
        cart[index];


    if (!item) return;


    const newQuantity =
        item.quantity +
        change;


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
        item.stock
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

}


// ==========================================
// REMOVE
// ==========================================

function removeFromCart(index) {

    cart.splice(
        index,
        1
    );


    saveCart();

    updateCart();

}


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


document.getElementById(
    "cartButton"
).addEventListener(
    "click",
    openCart
);


document.getElementById(
    "closeCart"
).addEventListener(
    "click",
    closeCart
);


document.getElementById(
    "cartOverlay"
).addEventListener(
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


    content.innerHTML = `

        <div style="
            display:grid;
            grid-template-columns:
            1fr 1fr;
            gap:30px;
            align-items:center;
        ">

            <div class="shop-product-image"
                 style="height:350px; border-radius:15px;">

                ${
                    image

                    ? `<img
                        src="${image}"
                        alt="${getProductName(product)}">`

                    : `<i
                        class="fa-solid fa-box">
                       </i>`
                }

            </div>


            <div>

                <span class="shop-product-category">

                    ${getProductCategory(product)}

                </span>


                <h2 style="margin:10px 0;">

                    ${getProductName(product)}

                </h2>


                <p style="
                    color:#6b7280;
                    line-height:1.7;
                    font-size:13px;
                ">

                    ${getProductDescription(product)}

                </p>


                <h2 style="color:#6c4ab6;">

                    GH₵${getProductPrice(product).toFixed(2)}

                </h2>


                <p style="font-size:11px;">

                    ${
                        getProductStock(product) > 0

                        ? `${getProductStock(product)} items available`

                        : "Out of stock"
                    }

                </p>


                <button
                    class="checkout-btn"
                    onclick="addToCartFromModal(
                        '${product.id ||
                           product.productId ||
                           getProductName(product)}'
                    )"
                    ${
                        getProductStock(product) <= 0
                            ? "disabled"
                            : ""
                    }>

                    <i class="fa-solid fa-cart-plus"></i>

                    Add to Cart

                </button>

            </div>

        </div>

    `;


    modal.classList.add(
        "show"
    );

}


function addToCartFromModal(
    id
) {

    const product =
        products.find(
            item =>
                (
                    item.id ||
                    item.productId ||
                    getProductName(item)
                ).toString()
                === id.toString()
        );


    if (product) {

        addToCart(
            product
        );

    }

}


// ==========================================
// CLOSE PRODUCT MODAL
// ==========================================

document.getElementById(
    "closeProductModal"
).addEventListener(
    "click",
    function() {

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


categoryFilter.addEventListener(
    "change",
    function() {

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


        const selected =
            document.querySelector(
                `[data-category="${this.value}"]`
            );


        if (selected) {

            selected.classList.add(
                "active"
            );

        }


        renderProducts();

    }
);


// ==========================================
// START
// ==========================================

loadCategories();

renderProducts();

updateCart();
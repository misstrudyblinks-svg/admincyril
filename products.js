// ==========================================
// PRODUCT MANAGEMENT SYSTEM
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
// ELEMENTS
// ==========================================

const productModal =
    document.getElementById(
        "productModal"
    );

const openProductModal =
    document.getElementById(
        "openProductModal"
    );

const closeProductModal =
    document.getElementById(
        "closeProductModal"
    );

const cancelProduct =
    document.getElementById(
        "cancelProduct"
    );

const productForm =
    document.getElementById(
        "productForm"
    );

const productTableBody =
    document.getElementById(
        "productTableBody"
    );

const emptyProducts =
    document.getElementById(
        "emptyProducts"
    );

const productSearch =
    document.getElementById(
        "productSearch"
    );


// ==========================================
// FORM ELEMENTS
// ==========================================

const productId =
    document.getElementById(
        "productId"
    );

const productName =
    document.getElementById(
        "productName"
    );

const productCategory =
    document.getElementById(
        "productCategory"
    );

const productPrice =
    document.getElementById(
        "productPrice"
    );

const productStock =
    document.getElementById(
        "productStock"
    );

const lowStockLevel =
    document.getElementById(
        "lowStockLevel"
    );

const productModalTitle =
    document.getElementById(
        "productModalTitle"
    );


// ==========================================
// PRODUCT IMAGE ELEMENTS
// ==========================================

const productImage =
    document.getElementById(
        "productImage"
    );

const productImagePreview =
    document.getElementById(
        "productImagePreview"
    );


// ==========================================
// PRODUCT DATABASE
// ==========================================

let products =
    JSON.parse(
        localStorage.getItem("products")
    ) || [];


// ==========================================
// IMAGE PREVIEW
// ==========================================

if (productImage) {

    productImage.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];

            if (!file) {

                return;

            }


            // Check image type

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );

                this.value = "";

                return;

            }


            // Limit image size to 2MB

            if (
                file.size >
                2 * 1024 * 1024
            ) {

                alert(
                    "Please choose an image smaller than 2MB."
                );

                this.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    if (
                        productImagePreview
                    ) {

                        productImagePreview.src =
                            event.target.result;

                        productImagePreview.style.display =
                            "block";

                    }

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ==========================================
// OPEN PRODUCT MODAL
// ==========================================

openProductModal.addEventListener(
    "click",
    function () {

        productForm.reset();

        productId.value = "";

        lowStockLevel.value = 5;


        if (
            productImagePreview
        ) {

            productImagePreview.src =
                "";

            productImagePreview.style.display =
                "none";

        }


        productModalTitle.textContent =
            "Add Product";

        productModal.classList.add(
            "show"
        );

    }
);


// ==========================================
// CLOSE MODAL
// ==========================================

function closeProductModalFunction() {

    productModal.classList.remove(
        "show"
    );

}


closeProductModal.addEventListener(
    "click",
    closeProductModalFunction
);


cancelProduct.addEventListener(
    "click",
    closeProductModalFunction
);


productModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === productModal
        ) {

            closeProductModalFunction();

        }

    }
);


// ==========================================
// SAVE PRODUCT
// ==========================================

productForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const id =
            productId.value;


        // Find old product when editing

        const existingProduct =
            id
                ? products.find(
                    product =>
                        product.id === id
                )
                : null;


        // Keep old image when editing

        let image =
            existingProduct?.image ||
            "";


        // If a new image was selected,
        // use the preview image

        if (
            productImagePreview &&
            productImagePreview.src &&
            productImagePreview.style.display !==
            "none"
        ) {

            image =
                productImagePreview.src;

        }


        // CREATE PRODUCT DATA

        const productData = {

            id:
                id ||
                Date.now().toString(),

            name:
                productName.value.trim(),

            category:
                productCategory.value,

            price:
                Number(
                    productPrice.value
                ),

            stock:
                Number(
                    productStock.value
                ),

            lowStock:
                Number(
                    lowStockLevel.value
                ),

            image:
                image,

            date:
                existingProduct?.date ||
                new Date().toISOString()

        };


        // ==================================
        // VALIDATION
        // ==================================

        if (
            !productData.name
        ) {

            alert(
                "Please enter the product name."
            );

            return;

        }


        if (
            !productData.category
        ) {

            alert(
                "Please select a product category."
            );

            return;

        }


        if (
            productData.price < 0
        ) {

            alert(
                "Product price cannot be negative."
            );

            return;

        }


        if (
            productData.stock < 0
        ) {

            alert(
                "Product stock cannot be negative."
            );

            return;

        }


        // ==================================
        // EDIT PRODUCT
        // ==================================

        if (id) {

            products =
                products.map(
                    product =>

                        product.id === id

                            ? productData

                            : product
                );

        }


        // ==================================
        // ADD PRODUCT
        // ==================================

        else {

            products.push(
                productData
            );

        }


        // ==================================
        // SAVE DATABASE
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
                "Could not save products:",
                error
            );


            alert(
                "The product could not be saved. The image may be too large."
            );

            return;

        }


        // ==================================
        // SUCCESS
        // ==================================

        alert(
            id
                ? "Product updated successfully!"
                : "Product added successfully!"
        );


        closeProductModalFunction();

        renderProducts();

    }
);


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function renderProducts(
    searchTerm = ""
) {

    productTableBody.innerHTML = "";


    const search =
        searchTerm.toLowerCase();


    const filteredProducts =
        products.filter(
            product =>

                product.name
                    .toLowerCase()
                    .includes(search)

                ||

                product.category
                    .toLowerCase()
                    .includes(search)
        );


    if (
        filteredProducts.length === 0
    ) {

        emptyProducts.style.display =
            "block";

    }

    else {

        emptyProducts.style.display =
            "none";

    }


    filteredProducts.forEach(
        product => {

            const row =
                document.createElement(
                    "tr"
                );


            let status;

            let stockClass;


            if (
                product.stock === 0
            ) {

                status =
                    `<span class="product-status out-stock">
                        Out of Stock
                    </span>`;

                stockClass =
                    "out";

            }

            else if (
                product.stock <=
                product.lowStock
            ) {

                status =
                    `<span class="product-status low-stock">
                        Low Stock
                    </span>`;

                stockClass =
                    "low";

            }

            else {

                status =
                    `<span class="product-status in-stock">
                        In Stock
                    </span>`;

                stockClass =
                    "good";

            }


            // PRODUCT IMAGE

            const imageHTML =
                product.image

                    ? `
                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            style="
                                width:45px;
                                height:45px;
                                object-fit:cover;
                                border-radius:8px;
                            "
                        >
                    `

                    : `
                        <div class="product-image-icon">

                            <i class="fa-solid fa-box"></i>

                        </div>
                    `;


            row.innerHTML = `

                <td>

                    <div class="product-image-cell">

                        ${imageHTML}

                        <div>

                            <strong>
                                ${product.name}
                            </strong>

                            <span>
                                ID: ${product.id}
                            </span>

                        </div>

                    </div>

                </td>


                <td>
                    ${product.category}
                </td>


                <td>

                    <span class="product-price">

                        GH₵
                        ${Number(
                            product.price
                        ).toFixed(2)}

                    </span>

                </td>


                <td>

                    <span class="
                        product-stock
                        ${stockClass}
                    ">

                        ${product.stock}

                    </span>

                </td>


                <td>

                    ${status}

                </td>


                <td>

                    <div class="customer-actions">

                        <button
                            class="customer-action-btn edit-btn"
                            onclick="editProduct('${product.id}')">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="customer-action-btn delete-btn"
                            onclick="deleteProduct('${product.id}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            productTableBody.appendChild(
                row
            );

        }
    );


    updateProductStatistics();

}


// ==========================================
// EDIT PRODUCT
// ==========================================

function editProduct(
    id
) {

    const product =
        products.find(
            product =>
                product.id === id
        );


    if (!product) return;


    productId.value =
        product.id;

    productName.value =
        product.name;

    productCategory.value =
        product.category;

    productPrice.value =
        product.price;

    productStock.value =
        product.stock;

    lowStockLevel.value =
        product.lowStock;


    // SHOW EXISTING IMAGE

    if (
        productImagePreview
    ) {

        if (
            product.image
        ) {

            productImagePreview.src =
                product.image;

            productImagePreview.style.display =
                "block";

        }

        else {

            productImagePreview.src =
                "";

            productImagePreview.style.display =
                "none";

        }

    }


    // Clear file input so the
    // existing image is preserved

    if (
        productImage
    ) {

        productImage.value =
            "";

    }


    productModalTitle.textContent =
        "Edit Product";


    productModal.classList.add(
        "show"
    );

}


// ==========================================
// DELETE PRODUCT
// ==========================================

function deleteProduct(
    id
) {

    const product =
        products.find(
            product =>
                product.id === id
        );


    if (!product) return;


    const confirmed =
        confirm(
            `Delete ${product.name}?`
        );


    if (!confirmed) return;


    products =
        products.filter(
            product =>
                product.id !== id
        );


    localStorage.setItem(
        "products",
        JSON.stringify(
            products
        )
    );


    renderProducts();

}


// ==========================================
// SEARCH
// ==========================================

productSearch.addEventListener(
    "input",
    function () {

        renderProducts(
            productSearch.value
        );

    }
);


// ==========================================
// PRODUCT STATISTICS
// ==========================================

function updateProductStatistics() {


    // TOTAL PRODUCTS

    document.getElementById(
        "productCount"
    ).textContent =
        products.length;


    // TOTAL STOCK

    const totalStock =
        products.reduce(
            (
                total,
                product
            ) =>
                total +
                Number(
                    product.stock
                ),
            0
        );


    document.getElementById(
        "totalStock"
    ).textContent =
        totalStock;


    // CATEGORIES

    const categories =
        new Set(
            products.map(
                product =>
                    product.category
            )
        );


    document.getElementById(
        "categoryCount"
    ).textContent =
        categories.size;


    // LOW STOCK

    const lowStock =
        products.filter(
            product =>
                Number(
                    product.stock
                ) <=
                Number(
                    product.lowStock
                )
        ).length;


    document.getElementById(
        "lowStockCount"
    ).textContent =
        lowStock;

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


if (
    menuToggle &&
    sidebar
) {

    menuToggle.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (
    logoutBtn
) {

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

}


// ==========================================
// LOAD PRODUCTS
// ==========================================

renderProducts();
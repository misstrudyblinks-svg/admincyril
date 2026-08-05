// ==========================================
// BIZMANAGER PRODUCTS
// FIRESTORE VERSION
// Firebase Storage NOT REQUIRED
// ==========================================

import {
    db
} from "./firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// AUTHENTICATION CHECK
// ==========================================

// const loggedIn =
//     localStorage.getItem("adminLoggedIn");

// if (loggedIn !== "true") {

//     window.location.href =
//         "login.html";

// }


// ==========================================
// FIRESTORE COLLECTION
// ==========================================

const productsCollection =
    collection(
        db,
        "products"
    );


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
// IMAGE ELEMENTS
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
// PRODUCTS ARRAY
// ==========================================

let products = [];


// ==========================================
// CURRENT EDIT IMAGE
// ==========================================

let currentProductImage = "";


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// COMPRESS PRODUCT IMAGE
// ==========================================

function compressImage(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (!file) {

                resolve("");

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                reject(
                    new Error(
                        "Please select a valid image."
                    )
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    const image =
                        new Image();


                    image.onload =
                        function() {

                            const maxSize =
                                700;


                            let width =
                                image.width;

                            let height =
                                image.height;


                            if (
                                width >
                                maxSize ||
                                height >
                                maxSize
                            ) {

                                if (
                                    width >
                                    height
                                ) {

                                    height =
                                        Math.round(
                                            height *
                                            maxSize /
                                            width
                                        );

                                    width =
                                        maxSize;

                                }

                                else {

                                    width =
                                        Math.round(
                                            width *
                                            maxSize /
                                            height
                                        );

                                    height =
                                        maxSize;

                                }

                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                width;

                            canvas.height =
                                height;


                            const context =
                                canvas.getContext(
                                    "2d"
                                );


                            context.drawImage(
                                image,
                                0,
                                0,
                                width,
                                height
                            );


                            const compressed =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.65
                                );


                            // Firestore documents
                            // should not contain huge images.

                            if (
                                compressed.length >
                                700000
                            ) {

                                reject(
                                    new Error(
                                        "This image is still too large. Please choose a smaller picture."
                                    )
                                );

                                return;

                            }


                            resolve(
                                compressed
                            );

                        };


                    image.onerror =
                        function() {

                            reject(
                                new Error(
                                    "Could not process the image."
                                )
                            );

                        };


                    image.src =
                        event.target.result;

                };


            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Could not read the image."
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ==========================================
// IMAGE PREVIEW
// ==========================================

if (productImage) {

    productImage.addEventListener(
        "change",
        async function() {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            try {

                const compressedImage =
                    await compressImage(
                        file
                    );


                if (
                    productImagePreview
                ) {

                    productImagePreview.src =
                        compressedImage;

                    productImagePreview.style.display =
                        "block";

                }

            }

            catch(error) {

                alert(
                    error.message
                );

                this.value = "";

                if (
                    productImagePreview
                ) {

                    productImagePreview.src =
                        "";

                    productImagePreview.style.display =
                        "none";

                }

            }

        }
    );

}


// ==========================================
// LOAD PRODUCTS FROM FIRESTORE
// ==========================================

async function loadProducts() {

    try {

        productTableBody.innerHTML = `

            <tr>

                <td colspan="6"
                    style="
                        text-align:center;
                        padding:40px;
                    ">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading products...

                </td>

            </tr>

        `;


        const snapshot =
            await getDocs(
                productsCollection
            );


        products = [];


        snapshot.forEach(
            documentSnapshot => {

                products.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        renderProducts();


    }

    catch(error) {

        console.error(
            "Error loading products:",
            error
        );


        productTableBody.innerHTML = "";


        alert(
            "Products could not be loaded.\n\n" +
            error.message
        );

    }

}


// ==========================================
// OPEN ADD PRODUCT MODAL
// ==========================================

if (openProductModal) {

    openProductModal.addEventListener(
        "click",
        function() {

            productForm.reset();


            productId.value =
                "";


            lowStockLevel.value =
                "5";


            currentProductImage =
                "";


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

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeProductModalFunction() {

    productModal.classList.remove(
        "show"
    );

}


if (closeProductModal) {

    closeProductModal.addEventListener(
        "click",
        closeProductModalFunction
    );

}


if (cancelProduct) {

    cancelProduct.addEventListener(
        "click",
        closeProductModalFunction
    );

}


if (productModal) {

    productModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                productModal
            ) {

                closeProductModalFunction();

            }

        }
    );

}


// ==========================================
// SAVE PRODUCT
// ==========================================

productForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const id =
            productId.value.trim();


        const name =
            productName.value.trim();


        const category =
            productCategory.value;


        const price =
            Number(
                productPrice.value
            );


        const stock =
            Number(
                productStock.value
            );


        const lowStock =
            Number(
                lowStockLevel.value
            );


        // ==================================
        // VALIDATION
        // ==================================

        if (!name) {

            alert(
                "Please enter the product name."
            );

            return;

        }


        if (!category) {

            alert(
                "Please select a product category."
            );

            return;

        }


        if (
            price < 0 ||
            Number.isNaN(price)
        ) {

            alert(
                "Please enter a valid product price."
            );

            return;

        }


        if (
            stock < 0 ||
            Number.isNaN(stock)
        ) {

            alert(
                "Please enter a valid stock quantity."
            );

            return;

        }


        if (
            lowStock < 0 ||
            Number.isNaN(lowStock)
        ) {

            alert(
                "Please enter a valid low stock level."
            );

            return;

        }


        // ==================================
        // BUTTON
        // ==================================

        const saveButton =
            productForm.querySelector(
                'button[type="submit"]'
            );


        const originalButtonText =
            saveButton.innerHTML;


        saveButton.disabled =
            true;


        saveButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Saving...

        `;


        try {

            // ==================================
            // IMAGE
            // ==================================

            let image =
                currentProductImage;


            if (
                productImage &&
                productImage.files &&
                productImage.files.length > 0
            ) {

                image =
                    await compressImage(
                        productImage.files[0]
                    );

            }


            // ==================================
            // PRODUCT DATA
            // ==================================

            const productData = {

                name:
                    name,

                category:
                    category,

                price:
                    price,

                stock:
                    stock,

                quantity:
                    stock,

                lowStock:
                    lowStock,

                image:
                    image || "",

                updatedAt:
                    serverTimestamp()

            };


            // ==================================
            // EDIT PRODUCT
            // ==================================

            if (id) {

                const productReference =
                    doc(
                        db,
                        "products",
                        id
                    );


                await updateDoc(
                    productReference,
                    productData
                );


                alert(
                    "Product updated successfully!"
                );

            }


            // ==================================
            // ADD PRODUCT
            // ==================================

            else {

                productData.createdAt =
                    serverTimestamp();


                await addDoc(
                    productsCollection,
                    productData
                );


                alert(
                    "Product added successfully!"
                );

            }


            // ==================================
            // RESET
            // ==================================

            productForm.reset();


            productId.value =
                "";


            currentProductImage =
                "";


            if (
                productImagePreview
            ) {

                productImagePreview.src =
                    "";

                productImagePreview.style.display =
                    "none";

            }


            closeProductModalFunction();


            await loadProducts();

        }

        catch(error) {

            console.error(
                "Error saving product:",
                error
            );


            if (
                error.code ===
                "permission-denied"
            ) {

                alert(
                    "Firebase permission denied.\n\n" +
                    "Your Firestore security rules are currently preventing this save."
                );

            }

            else {

                alert(
                    "The product could not be saved.\n\n" +
                    error.message
                );

            }

        }

        finally {

            saveButton.disabled =
                false;


            saveButton.innerHTML =
                originalButtonText;

        }

    }
);


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function renderProducts(
    searchTerm = ""
) {

    productTableBody.innerHTML =
        "";


    const search =
        searchTerm
            .toLowerCase()
            .trim();


    const filteredProducts =
        products.filter(
            product => {

                const name =
                    String(
                        product.name || ""
                    )
                    .toLowerCase();


                const category =
                    String(
                        product.category || ""
                    )
                    .toLowerCase();


                return (
                    name.includes(
                        search
                    ) ||
                    category.includes(
                        search
                    )
                );

            }
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


            const stock =
                Number(
                    product.stock ??
                    product.quantity ??
                    0
                );


            const lowStock =
                Number(
                    product.lowStock ??
                    5
                );


            let status =
                "";


            let stockClass =
                "";


            if (
                stock <= 0
            ) {

                status = `

                    <span class="product-status out-stock">

                        Out of Stock

                    </span>

                `;

                stockClass =
                    "out";

            }

            else if (
                stock <= lowStock
            ) {

                status = `

                    <span class="product-status low-stock">

                        Low Stock

                    </span>

                `;

                stockClass =
                    "low";

            }

            else {

                status = `

                    <span class="product-status in-stock">

                        In Stock

                    </span>

                `;

                stockClass =
                    "good";

            }


            // ==================================
            // IMAGE
            // ==================================

            const imageHTML =
                product.image

                    ? `

                        <img
                            src="${product.image}"
                            alt="${escapeHTML(product.name)}"
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

                                ${escapeHTML(
                                    product.name ||
                                    "Unnamed Product"
                                )}

                            </strong>

                            <span>

                                ID:
                                ${escapeHTML(
                                    product.id
                                )}

                            </span>

                        </div>

                    </div>

                </td>


                <td>

                    ${escapeHTML(
                        product.category ||
                        "Other"
                    )}

                </td>


                <td>

                    <span class="product-price">

                        GH₵${Number(
                            product.price || 0
                        ).toFixed(2)}

                    </span>

                </td>


                <td>

                    <span class="
                        product-stock
                        ${stockClass}
                    ">

                        ${stock}

                    </span>

                </td>


                <td>

                    ${status}

                </td>


                <td>

                    <div class="customer-actions">

                        <button
                            class="customer-action-btn edit-btn"
                            data-action="edit"
                            data-id="${escapeHTML(product.id)}"
                            title="Edit Product">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="customer-action-btn delete-btn"
                            data-action="delete"
                            data-id="${escapeHTML(product.id)}"
                            title="Delete Product">

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
// TABLE ACTIONS
// ==========================================

productTableBody.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) {

            return;

        }


        const id =
            button.dataset.id;


        const action =
            button.dataset.action;


        if (
            action === "edit"
        ) {

            editProduct(
                id
            );

        }


        if (
            action === "delete"
        ) {

            deleteProduct(
                id
            );

        }

    }
);


// ==========================================
// EDIT PRODUCT
// ==========================================

function editProduct(
    id
) {

    const product =
        products.find(
            item =>
                item.id === id
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    productId.value =
        product.id;


    productName.value =
        product.name || "";


    productCategory.value =
        product.category || "";


    productPrice.value =
        product.price ?? "";


    productStock.value =
        product.stock ??
        product.quantity ??
        0;


    lowStockLevel.value =
        product.lowStock ??
        5;


    currentProductImage =
        product.image || "";


    if (
        productImage
    ) {

        productImage.value =
            "";

    }


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


    productModalTitle.textContent =
        "Edit Product";


    productModal.classList.add(
        "show"
    );

}


// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(
    id
) {

    const product =
        products.find(
            item =>
                item.id === id
        );


    if (!product) {

        return;

    }


    const confirmed =
        confirm(
            `Delete ${product.name}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                id
            )
        );


        alert(
            "Product deleted successfully!"
        );


        await loadProducts();

    }

    catch(error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "The product could not be deleted.\n\n" +
            error.message
        );

    }

}


// ==========================================
// SEARCH
// ==========================================

if (productSearch) {

    productSearch.addEventListener(
        "input",
        function() {

            renderProducts(
                productSearch.value
            );

        }
    );

}


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
            ) => {

                return (
                    total +
                    Number(
                        product.stock ??
                        product.quantity ??
                        0
                    )
                );

            },
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
            product => {

                const stock =
                    Number(
                        product.stock ??
                        product.quantity ??
                        0
                    );


                const level =
                    Number(
                        product.lowStock ??
                        5
                    );


                return (
                    stock <= level
                );

            }
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
        function() {

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
        function() {

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
// START
// ==========================================

loadProducts();
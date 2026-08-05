// ==========================================
// BIZMANAGER CUSTOMER MANAGEMENT
// FIREBASE FIRESTORE VERSION
// ==========================================

import {
    db
} from "./firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// AUTHENTICATION
// ==========================================

const loggedIn =
    localStorage.getItem("adminLoggedIn");

if (loggedIn !== "true") {

    window.location.href = "login.html";

}


// ==========================================
// FIREBASE COLLECTION
// ==========================================

const customersCollection =
    collection(db, "customers");


// ==========================================
// ELEMENTS
// ==========================================

const customerModal =
    document.getElementById("customerModal");

const openCustomerModal =
    document.getElementById("openCustomerModal");

const closeCustomerModal =
    document.getElementById("closeCustomerModal");

const cancelCustomer =
    document.getElementById("cancelCustomer");

const customerForm =
    document.getElementById("customerForm");

const customerTableBody =
    document.getElementById("customerTableBody");

const emptyCustomers =
    document.getElementById("emptyCustomers");

const customerSearch =
    document.getElementById("customerSearch");


// ==========================================
// FORM INPUTS
// ==========================================

const customerId =
    document.getElementById("customerId");

const customerName =
    document.getElementById("customerName");

const customerPhone =
    document.getElementById("customerPhone");

const customerEmail =
    document.getElementById("customerEmail");

const customerLocation =
    document.getElementById("customerLocation");

const customerStatus =
    document.getElementById("customerStatus");

const modalTitle =
    document.getElementById("modalTitle");


// ==========================================
// CUSTOMER DATA
// ==========================================

let customers = [];


// ==========================================
// LOAD CUSTOMERS FROM FIREBASE
// ==========================================

async function loadCustomers() {

    try {

        customerTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Loading customers...
                </td>
            </tr>
        `;

        const snapshot =
            await getDocs(
                customersCollection
            );

        customers = [];

        snapshot.forEach(
            documentSnapshot => {

                customers.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        // Sort newest first

        customers.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.date || 0
                    );

                const dateB =
                    new Date(
                        b.date || 0
                    );

                return dateB - dateA;

            }
        );


        renderCustomers();

    }

    catch (error) {

        console.error(
            "Error loading customers:",
            error
        );

        customerTableBody.innerHTML = "";

        emptyCustomers.style.display =
            "block";

        emptyCustomers.innerHTML = `

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h3>
                Customers could not be loaded
            </h3>

            <p>
                ${error.message}
            </p>

        `;

        alert(
            "Customers could not be loaded.\n\n" +
            error.message
        );

    }

}


// ==========================================
// OPEN MODAL
// ==========================================

openCustomerModal.addEventListener(
    "click",
    function () {

        customerForm.reset();

        customerId.value = "";

        modalTitle.textContent =
            "Add Customer";

        customerModal.classList.add(
            "show"
        );

    }
);


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    customerModal.classList.remove(
        "show"
    );

}


closeCustomerModal.addEventListener(
    "click",
    closeModal
);


cancelCustomer.addEventListener(
    "click",
    closeModal
);


// ==========================================
// CLOSE WHEN CLICKING OUTSIDE
// ==========================================

customerModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            customerModal
        ) {

            closeModal();

        }

    }
);


// ==========================================
// SAVE CUSTOMER
// ==========================================

customerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const id =
            customerId.value;


        const customerData = {

            name:
                customerName.value.trim(),

            phone:
                customerPhone.value.trim(),

            email:
                customerEmail.value.trim(),

            location:
                customerLocation.value.trim(),

            status:
                customerStatus.value,

            date:
                id
                    ? (
                        customers.find(
                            customer =>
                                customer.id === id
                        )?.date ||
                        new Date().toISOString()
                    )
                    : new Date().toISOString()

        };


        // ==================================
        // VALIDATION
        // ==================================

        if (!customerData.name) {

            alert(
                "Please enter the customer's name."
            );

            return;

        }


        if (!customerData.phone) {

            alert(
                "Please enter the customer's phone number."
            );

            return;

        }


        try {

            // ==================================
            // EDIT CUSTOMER
            // ==================================

            if (id) {

                const customerRef =
                    doc(
                        db,
                        "customers",
                        id
                    );

                await updateDoc(
                    customerRef,
                    customerData
                );

                alert(
                    "Customer updated successfully!"
                );

            }


            // ==================================
            // ADD CUSTOMER
            // ==================================

            else {

                await addDoc(
                    customersCollection,
                    customerData
                );

                alert(
                    "Customer added successfully!"
                );

            }


            // Close modal

            closeModal();


            // Reload Firebase data

            await loadCustomers();

        }

        catch (error) {

            console.error(
                "Error saving customer:",
                error
            );

            alert(
                "Customer could not be saved.\n\n" +
                error.message
            );

        }

    }
);


// ==========================================
// DISPLAY CUSTOMERS
// ==========================================

function renderCustomers(
    searchTerm = ""
) {

    customerTableBody.innerHTML = "";


    const search =
        searchTerm
            .toLowerCase()
            .trim();


    const filteredCustomers =
        customers.filter(
            customer => {

                const name =
                    (
                        customer.name ||
                        ""
                    ).toLowerCase();

                const phone =
                    (
                        customer.phone ||
                        ""
                    ).toLowerCase();

                const email =
                    (
                        customer.email ||
                        ""
                    ).toLowerCase();

                const location =
                    (
                        customer.location ||
                        ""
                    ).toLowerCase();


                return (

                    name.includes(search)

                    ||

                    phone.includes(search)

                    ||

                    email.includes(search)

                    ||

                    location.includes(search)

                );

            }
        );


    // ==================================
    // EMPTY
    // ==================================

    if (
        filteredCustomers.length === 0
    ) {

        emptyCustomers.style.display =
            "block";

    }

    else {

        emptyCustomers.style.display =
            "none";

    }


    // ==================================
    // CREATE ROWS
    // ==================================

    filteredCustomers.forEach(
        customer => {

            const initials =
                getInitials(
                    customer.name ||
                    "Customer"
                );


            const row =
                document.createElement(
                    "tr"
                );


            const status =
                customer.status ||
                "Active";


            row.innerHTML = `

                <td>

                    <div class="customer-name-cell">

                        <div class="customer-avatar-large">

                            ${initials}

                        </div>

                        <div>

                            <strong>
                                ${customer.name || "-"}
                            </strong>

                            <span>
                                Customer
                            </span>

                        </div>

                    </div>

                </td>


                <td>
                    ${customer.phone || "-"}
                </td>


                <td>
                    ${customer.email || "-"}
                </td>


                <td>
                    ${customer.location || "-"}
                </td>


                <td>

                    <span class="
                        customer-status
                        ${status.toLowerCase()}
                    ">

                        ${status}

                    </span>

                </td>


                <td>

                    <div class="customer-actions">

                        <button
                            class="customer-action-btn edit-btn"
                            data-id="${customer.id}"
                            title="Edit Customer">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="customer-action-btn delete-btn"
                            data-id="${customer.id}"
                            title="Delete Customer">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            // ==================================
            // EDIT BUTTON
            // ==================================

            row
                .querySelector(".edit-btn")
                .addEventListener(
                    "click",
                    function () {

                        editCustomer(
                            this.dataset.id
                        );

                    }
                );


            // ==================================
            // DELETE BUTTON
            // ==================================

            row
                .querySelector(".delete-btn")
                .addEventListener(
                    "click",
                    function () {

                        deleteCustomer(
                            this.dataset.id
                        );

                    }
                );


            customerTableBody.appendChild(
                row
            );

        }
    );


    updateStatistics();

}


// ==========================================
// GET INITIALS
// ==========================================

function getInitials(name) {

    return name
        .trim()
        .split(/\s+/)
        .map(
            word =>
                word.charAt(0)
        )
        .slice(0, 2)
        .join("")
        .toUpperCase();

}


// ==========================================
// EDIT CUSTOMER
// ==========================================

function editCustomer(id) {

    const customer =
        customers.find(
            customer =>
                customer.id === id
        );


    if (!customer) {

        alert(
            "Customer not found."
        );

        return;

    }


    customerId.value =
        customer.id;

    customerName.value =
        customer.name || "";

    customerPhone.value =
        customer.phone || "";

    customerEmail.value =
        customer.email || "";

    customerLocation.value =
        customer.location || "";

    customerStatus.value =
        customer.status || "Active";


    modalTitle.textContent =
        "Edit Customer";


    customerModal.classList.add(
        "show"
    );

}


// ==========================================
// DELETE CUSTOMER
// ==========================================

async function deleteCustomer(id) {

    const customer =
        customers.find(
            customer =>
                customer.id === id
        );


    if (!customer) {

        return;

    }


    const confirmed =
        confirm(
            `Delete ${customer.name}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "customers",
                id
            )
        );


        alert(
            "Customer deleted successfully!"
        );


        await loadCustomers();

    }

    catch (error) {

        console.error(
            "Error deleting customer:",
            error
        );

        alert(
            "Customer could not be deleted.\n\n" +
            error.message
        );

    }

}


// ==========================================
// SEARCH
// ==========================================

customerSearch.addEventListener(
    "input",
    function () {

        renderCustomers(
            customerSearch.value
        );

    }
);


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    // TOTAL

    const total =
        customers.length;


    // ACTIVE

    const active =
        customers.filter(
            customer =>
                customer.status === "Active"
        ).length;


    // CURRENT MONTH

    const currentMonth =
        new Date().getMonth();

    const currentYear =
        new Date().getFullYear();


    const newThisMonth =
        customers.filter(
            customer => {

                const date =
                    new Date(
                        customer.date
                    );


                return (

                    date.getMonth()
                    ===
                    currentMonth

                    &&

                    date.getFullYear()
                    ===
                    currentYear

                );

            }
        ).length;


    // CONTACTS

    const contacts =
        customers.filter(
            customer =>
                customer.phone
        ).length;


    // DISPLAY

    document.getElementById(
        "customerCount"
    ).textContent =
        total;


    document.getElementById(
        "activeCustomerCount"
    ).textContent =
        active;


    document.getElementById(
        "newCustomerCount"
    ).textContent =
        newThisMonth;


    document.getElementById(
        "contactCount"
    ).textContent =
        contacts;

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


if (logoutBtn) {

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
// START
// ==========================================

loadCustomers();
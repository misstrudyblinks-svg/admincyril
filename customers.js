// ==========================================
// CUSTOMER MANAGEMENT SYSTEM
// ==========================================


// ==========================================
// AUTHENTICATION
// ==========================================

const loggedIn =
    localStorage.getItem("adminLoggedIn");

if (loggedIn !== "true") {

    window.location.href = "login.html";

}


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
// CUSTOMER DATABASE
// ==========================================

let customers =
    JSON.parse(
        localStorage.getItem("customers")
    ) || [];


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

        customerModal.classList.add("show");

    }
);


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    customerModal.classList.remove("show");

}

closeCustomerModal.addEventListener(
    "click",
    closeModal
);

cancelCustomer.addEventListener(
    "click",
    closeModal
);


// Close when clicking outside

customerModal.addEventListener(
    "click",
    function (event) {

        if (event.target === customerModal) {

            closeModal();

        }

    }
);


// ==========================================
// SAVE CUSTOMER
// ==========================================

customerForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const id =
            customerId.value;


        const customerData = {

            id:
                id ||
                Date.now().toString(),

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
                    ? customers.find(
                        customer =>
                        customer.id === id
                    )?.date
                    : new Date().toISOString()

        };


        // EDIT CUSTOMER

        if (id) {

            customers =
                customers.map(
                    customer =>
                        customer.id === id
                            ? customerData
                            : customer
                );

        }

        // ADD CUSTOMER

        else {

            customers.push(
                customerData
            );

        }


        // Save database

        localStorage.setItem(
            "customers",
            JSON.stringify(customers)
        );


        closeModal();

        renderCustomers();

    }
);


// ==========================================
// DISPLAY CUSTOMERS
// ==========================================

function renderCustomers(
    searchTerm = ""
) {

    customerTableBody.innerHTML = "";


    const filteredCustomers =
        customers.filter(
            customer => {

                const search =
                    searchTerm.toLowerCase();

                return (

                    customer.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    customer.phone
                        .toLowerCase()
                        .includes(search)

                    ||

                    customer.email
                        .toLowerCase()
                        .includes(search)

                    ||

                    customer.location
                        .toLowerCase()
                        .includes(search)

                );

            }
        );


    if (filteredCustomers.length === 0) {

        emptyCustomers.style.display =
            "block";

    }

    else {

        emptyCustomers.style.display =
            "none";

    }


    filteredCustomers.forEach(
        customer => {

            const initials =
                getInitials(
                    customer.name
                );


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <div class="customer-name-cell">

                        <div class="customer-avatar-large">

                            ${initials}

                        </div>

                        <div>

                            <strong>
                                ${customer.name}
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
                        ${customer.status.toLowerCase()}
                    ">

                        ${customer.status}

                    </span>

                </td>


                <td>

                    <div class="customer-actions">

                        <button
                            class="customer-action-btn edit-btn"
                            onclick="editCustomer('${customer.id}')">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="customer-action-btn delete-btn"
                            onclick="deleteCustomer('${customer.id}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            customerTableBody.appendChild(row);

        }
    );


    updateStatistics();

}


// ==========================================
// GET INITIALS
// ==========================================

function getInitials(name) {

    return name
        .split(" ")
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


    if (!customer) return;


    customerId.value =
        customer.id;

    customerName.value =
        customer.name;

    customerPhone.value =
        customer.phone;

    customerEmail.value =
        customer.email;

    customerLocation.value =
        customer.location;

    customerStatus.value =
        customer.status;


    modalTitle.textContent =
        "Edit Customer";


    customerModal.classList.add(
        "show"
    );

}


// ==========================================
// DELETE CUSTOMER
// ==========================================

function deleteCustomer(id) {

    const customer =
        customers.find(
            customer =>
                customer.id === id
        );


    if (!customer) return;


    const confirmed =
        confirm(
            `Delete ${customer.name}?`
        );


    if (!confirmed) return;


    customers =
        customers.filter(
            customer =>
                customer.id !== id
        );


    localStorage.setItem(
        "customers",
        JSON.stringify(customers)
    );


    renderCustomers();

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

    const total =
        customers.length;


    const active =
        customers.filter(
            customer =>
                customer.status === "Active"
        ).length;


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
                        === currentMonth

                    &&

                    date.getFullYear()
                        === currentYear
                );

            }
        ).length;


    document.getElementById(
        "customerCount"
    ).textContent = total;


    document.getElementById(
        "activeCustomerCount"
    ).textContent = active;


    document.getElementById(
        "newCustomerCount"
    ).textContent = newThisMonth;


    document.getElementById(
        "contactCount"
    ).textContent = customers.filter(
        customer =>
            customer.phone
    ).length;

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
// LOAD CUSTOMERS
// ==========================================

renderCustomers();
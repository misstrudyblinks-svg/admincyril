// ==========================================
// EXPENSE MANAGEMENT SYSTEM
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
// DATABASE
// ==========================================

let expenses =
    JSON.parse(
        localStorage.getItem("expenses")
    ) || [];


// ==========================================
// ELEMENTS
// ==========================================

const expenseModal =
    document.getElementById("expenseModal");

const openExpenseModal =
    document.getElementById("openExpenseModal");

const closeExpenseModal =
    document.getElementById("closeExpenseModal");

const cancelExpense =
    document.getElementById("cancelExpense");

const expenseForm =
    document.getElementById("expenseForm");

const expenseId =
    document.getElementById("expenseId");

const expenseDescription =
    document.getElementById("expenseDescription");

const expenseCategory =
    document.getElementById("expenseCategory");

const expenseAmount =
    document.getElementById("expenseAmount");

const expenseDate =
    document.getElementById("expenseDate");

const expenseNotes =
    document.getElementById("expenseNotes");

const expenseModalTitle =
    document.getElementById("expenseModalTitle");

const expenseTableBody =
    document.getElementById("expenseTableBody");

const emptyExpenses =
    document.getElementById("emptyExpenses");

const expenseSearch =
    document.getElementById("expenseSearch");


// ==========================================
// OPEN MODAL
// ==========================================

openExpenseModal.addEventListener(
    "click",
    function () {

        expenseForm.reset();

        expenseId.value = "";

        expenseDate.value =
            new Date()
                .toISOString()
                .split("T")[0];

        expenseModalTitle.textContent =
            "Add Expense";

        expenseModal.classList.add("show");

    }
);


// ==========================================
// CLOSE MODAL
// ==========================================

function closeExpenseModalFunction() {

    expenseModal.classList.remove("show");

}


closeExpenseModal.addEventListener(
    "click",
    closeExpenseModalFunction
);


cancelExpense.addEventListener(
    "click",
    closeExpenseModalFunction
);


expenseModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === expenseModal
        ) {

            closeExpenseModalFunction();

        }

    }
);


// ==========================================
// SAVE EXPENSE
// ==========================================

expenseForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const id =
            expenseId.value;


        const expenseData = {

            id:
                id ||
                "EXP-" +
                Date.now(),

            description:
                expenseDescription.value.trim(),

            category:
                expenseCategory.value,

            amount:
                Number(
                    expenseAmount.value
                ),

            date:
                expenseDate.value,

            notes:
                expenseNotes.value.trim()

        };


        if (
            expenseData.amount <= 0
        ) {

            alert(
                "Please enter a valid expense amount."
            );

            return;

        }


        // EDIT

        if (id) {

            expenses =
                expenses.map(
                    expense =>

                        expense.id === id
                            ? expenseData
                            : expense

                );

        }

        // ADD

        else {

            expenses.unshift(
                expenseData
            );

        }


        // SAVE

        localStorage.setItem(
            "expenses",
            JSON.stringify(expenses)
        );


        closeExpenseModalFunction();

        renderExpenses();

    }
);


// ==========================================
// DISPLAY EXPENSES
// ==========================================

function renderExpenses(
    searchTerm = ""
) {

    expenseTableBody.innerHTML = "";


    const search =
        searchTerm.toLowerCase();


    const filteredExpenses =
        expenses.filter(
            expense =>

                expense.id
                    .toLowerCase()
                    .includes(search)

                ||

                expense.description
                    .toLowerCase()
                    .includes(search)

                ||

                expense.category
                    .toLowerCase()
                    .includes(search)
        );


    if (
        filteredExpenses.length === 0
    ) {

        emptyExpenses.style.display =
            "block";

    }

    else {

        emptyExpenses.style.display =
            "none";

    }


    filteredExpenses.forEach(
        expense => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>

                    <span class="expense-id">

                        ${expense.id}

                    </span>

                </td>


                <td>

                    <strong>

                        ${expense.description}

                    </strong>

                </td>


                <td>

                    ${expense.category}

                </td>


                <td>

                    <span class="expense-amount">

                        GH₵${expense.amount.toFixed(2)}

                    </span>

                </td>


                <td>

                    <span class="expense-date">

                        ${formatDate(expense.date)}

                    </span>

                </td>


                <td>

                    <div class="customer-actions">

                        <button
                            class="customer-action-btn edit-btn"
                            onclick="editExpense('${expense.id}')">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="customer-action-btn delete-btn"
                            onclick="deleteExpense('${expense.id}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            expenseTableBody.appendChild(row);

        }
    );


    updateExpenseStatistics();

}


// ==========================================
// EDIT EXPENSE
// ==========================================

function editExpense(id) {

    const expense =
        expenses.find(
            expense =>
                expense.id === id
        );


    if (!expense) return;


    expenseId.value =
        expense.id;

    expenseDescription.value =
        expense.description;

    expenseCategory.value =
        expense.category;

    expenseAmount.value =
        expense.amount;

    expenseDate.value =
        expense.date;

    expenseNotes.value =
        expense.notes || "";


    expenseModalTitle.textContent =
        "Edit Expense";


    expenseModal.classList.add("show");

}


// ==========================================
// DELETE EXPENSE
// ==========================================

function deleteExpense(id) {

    const expense =
        expenses.find(
            expense =>
                expense.id === id
        );


    if (!expense) return;


    const confirmed =
        confirm(
            `Delete ${expense.description}?`
        );


    if (!confirmed) return;


    expenses =
        expenses.filter(
            expense =>
                expense.id !== id
        );


    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );


    renderExpenses();

}


// ==========================================
// SEARCH
// ==========================================

expenseSearch.addEventListener(
    "input",
    function () {

        renderExpenses(
            expenseSearch.value
        );

    }
);


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    if (!dateString) return "-";


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-GH",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// STATISTICS
// ==========================================

function updateExpenseStatistics() {


    // TOTAL

    const total =
        expenses.reduce(
            (
                sum,
                expense
            ) =>
                sum +
                expense.amount,
            0
        );


    // TODAY

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayTotal =
        expenses
            .filter(
                expense =>
                    expense.date === today
            )
            .reduce(
                (
                    sum,
                    expense
                ) =>
                    sum +
                    expense.amount,
                0
            );


    // AVERAGE

    const average =
        expenses.length > 0
            ? total / expenses.length
            : 0;


    document.getElementById(
        "totalExpenses"
    ).textContent =
        `GH₵${total.toFixed(2)}`;


    document.getElementById(
        "todayExpenses"
    ).textContent =
        `GH₵${todayTotal.toFixed(2)}`;


    document.getElementById(
        "expenseCount"
    ).textContent =
        expenses.length;


    document.getElementById(
        "averageExpense"
    ).textContent =
        `GH₵${average.toFixed(2)}`;

}


// ==========================================
// MOBILE SIDEBAR
// ==========================================

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");


menuToggle.addEventListener(
    "click",
    function () {

        sidebar.classList.toggle("open");

    }
);


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById("logoutBtn");


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
// INITIAL LOAD
// ==========================================

renderExpenses();
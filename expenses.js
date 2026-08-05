// ==========================================
// BIZMANAGER EXPENSE MANAGEMENT
// FIREBASE FIRESTORE VERSION
// ==========================================


// ==========================================
// FIREBASE IMPORTS
// ==========================================

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    db
} from "./firebase-config.js";


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

const expensesCollection =
    collection(db, "expenses");


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
// EXPENSE DATA
// ==========================================

let expenses = [];


// ==========================================
// LOAD EXPENSES FROM FIREBASE
// ==========================================

async function loadExpenses() {

    try {

        expenseTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Loading expenses...
                </td>
            </tr>
        `;


        // ==================================
        // GET EXPENSES
        // ==================================

        const expenseQuery =
            query(
                expensesCollection,
                orderBy("date", "desc")
            );


        const snapshot =
            await getDocs(
                expenseQuery
            );


        expenses = [];


        snapshot.forEach(
            documentSnapshot => {

                expenses.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        renderExpenses();

    }

    catch (error) {

        console.error(
            "Error loading expenses:",
            error
        );


        expenseTableBody.innerHTML = "";


        emptyExpenses.style.display =
            "block";


        emptyExpenses.innerHTML = `

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h3>
                Expenses could not be loaded
            </h3>

            <p>
                ${error.message}
            </p>

        `;


        alert(
            "Expenses could not be loaded.\n\n" +
            error.message
        );

    }

}


// ==========================================
// OPEN EXPENSE MODAL
// ==========================================

openExpenseModal.addEventListener(
    "click",
    function () {

        expenseForm.reset();


        expenseId.value = "";


        // Set today's date

        expenseDate.value =
            new Date()
                .toISOString()
                .split("T")[0];


        expenseModalTitle.textContent =
            "Add Expense";


        expenseModal.classList.add(
            "show"
        );

    }
);


// ==========================================
// CLOSE EXPENSE MODAL
// ==========================================

function closeExpenseModalFunction() {

    expenseModal.classList.remove(
        "show"
    );

}


closeExpenseModal.addEventListener(
    "click",
    closeExpenseModalFunction
);


cancelExpense.addEventListener(
    "click",
    closeExpenseModalFunction
);


// ==========================================
// CLOSE WHEN CLICKING OUTSIDE
// ==========================================

expenseModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            expenseModal
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
    async function (event) {

        event.preventDefault();


        const id =
            expenseId.value;


        const description =
            expenseDescription.value.trim();


        const category =
            expenseCategory.value;


        const amount =
            Number(
                expenseAmount.value
            );


        const date =
            expenseDate.value;


        const notes =
            expenseNotes.value.trim();


        // ==================================
        // VALIDATION
        // ==================================

        if (!description) {

            alert(
                "Please enter the expense description."
            );

            return;

        }


        if (!category) {

            alert(
                "Please select an expense category."
            );

            return;

        }


        if (
            !amount ||
            amount <= 0
        ) {

            alert(
                "Please enter a valid expense amount."
            );

            return;

        }


        if (!date) {

            alert(
                "Please select the expense date."
            );

            return;

        }


        try {

            // ==================================
            // EXPENSE DATA
            // ==================================

            const expenseData = {

                description:
                    description,

                category:
                    category,

                amount:
                    amount,

                date:
                    date,

                notes:
                    notes,

                updatedAt:
                    new Date().toISOString()

            };


            // ==================================
            // EDIT EXPENSE
            // ==================================

            if (id) {

                const expenseRef =
                    doc(
                        db,
                        "expenses",
                        id
                    );


                await updateDoc(
                    expenseRef,
                    expenseData
                );


                alert(
                    "Expense updated successfully!"
                );

            }


            // ==================================
            // ADD EXPENSE
            // ==================================

            else {

                expenseData.createdAt =
                    new Date().toISOString();


                await addDoc(
                    expensesCollection,
                    expenseData
                );


                alert(
                    "Expense added successfully!"
                );

            }


            // ==================================
            // CLOSE MODAL
            // ==================================

            closeExpenseModalFunction();


            // ==================================
            // RELOAD FIREBASE DATA
            // ==================================

            await loadExpenses();

        }

        catch (error) {

            console.error(
                "Error saving expense:",
                error
            );


            alert(
                "Expense could not be saved.\n\n" +
                error.message
            );

        }

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
        searchTerm
            .toLowerCase()
            .trim();


    const filteredExpenses =
        expenses.filter(
            expense => {

                const id =
                    (
                        expense.id ||
                        ""
                    ).toLowerCase();


                const description =
                    (
                        expense.description ||
                        ""
                    ).toLowerCase();


                const category =
                    (
                        expense.category ||
                        ""
                    ).toLowerCase();


                const notes =
                    (
                        expense.notes ||
                        ""
                    ).toLowerCase();


                return (

                    id.includes(search)

                    ||

                    description.includes(search)

                    ||

                    category.includes(search)

                    ||

                    notes.includes(search)

                );

            }
        );


    // ==================================
    // EMPTY STATE
    // ==================================

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


    // ==================================
    // CREATE TABLE ROWS
    // ==================================

    filteredExpenses.forEach(
        expense => {

            const row =
                document.createElement(
                    "tr"
                );


            const amount =
                Number(
                    expense.amount || 0
                );


            row.innerHTML = `

                <td>

                    <span class="expense-id">

                        ${expense.id}

                    </span>

                </td>


                <td>

                    <strong>

                        ${expense.description || "-"}

                    </strong>

                </td>


                <td>

                    ${expense.category || "-"}

                </td>


                <td>

                    <span class="expense-amount">

                        GH₵${amount.toFixed(2)}

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
                            data-action="edit"
                            data-id="${expense.id}"
                            title="Edit Expense">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="customer-action-btn delete-btn"
                            data-action="delete"
                            data-id="${expense.id}"
                            title="Delete Expense">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            // ==================================
            // EDIT BUTTON
            // ==================================

            row
                .querySelector(
                    '[data-action="edit"]'
                )
                .addEventListener(
                    "click",
                    function () {

                        editExpense(
                            expense.id
                        );

                    }
                );


            // ==================================
            // DELETE BUTTON
            // ==================================

            row
                .querySelector(
                    '[data-action="delete"]'
                )
                .addEventListener(
                    "click",
                    function () {

                        deleteExpense(
                            expense.id
                        );

                    }
                );


            expenseTableBody.appendChild(
                row
            );

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


    if (!expense) {

        alert(
            "Expense not found."
        );

        return;

    }


    expenseId.value =
        expense.id;


    expenseDescription.value =
        expense.description || "";


    expenseCategory.value =
        expense.category || "";


    expenseAmount.value =
        expense.amount || "";


    expenseDate.value =
        expense.date || "";


    expenseNotes.value =
        expense.notes || "";


    expenseModalTitle.textContent =
        "Edit Expense";


    expenseModal.classList.add(
        "show"
    );

}


// ==========================================
// DELETE EXPENSE
// ==========================================

async function deleteExpense(id) {

    const expense =
        expenses.find(
            expense =>
                expense.id === id
        );


    if (!expense) {

        alert(
            "Expense not found."
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete ${expense.description || "this expense"}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        // ==================================
        // DELETE FROM FIREBASE
        // ==================================

        await deleteDoc(
            doc(
                db,
                "expenses",
                id
            )
        );


        alert(
            "Expense deleted successfully!"
        );


        // ==================================
        // RELOAD DATA
        // ==================================

        await loadExpenses();

    }

    catch (error) {

        console.error(
            "Error deleting expense:",
            error
        );


        alert(
            "Expense could not be deleted.\n\n" +
            error.message
        );

    }

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

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


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
// EXPENSE STATISTICS
// ==========================================

function updateExpenseStatistics() {

    // ==================================
    // TOTAL EXPENSES
    // ==================================

    const total =
        expenses.reduce(
            (
                sum,
                expense
            ) => {

                return (
                    sum +
                    Number(
                        expense.amount || 0
                    )
                );

            },
            0
        );


    // ==================================
    // TODAY
    // ==================================

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
                ) => {

                    return (
                        sum +
                        Number(
                            expense.amount || 0
                        )
                    );

                },
                0
            );


    // ==================================
    // AVERAGE
    // ==================================

    const average =
        expenses.length > 0
            ? total /
              expenses.length
            : 0;


    // ==================================
    // DISPLAY
    // ==================================

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
// INITIAL LOAD
// ==========================================

loadExpenses();
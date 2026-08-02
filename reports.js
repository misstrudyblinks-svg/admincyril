// ==========================================
// REPORTS & ANALYTICS
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
// LOAD DATABASES
// ==========================================

let sales =
    JSON.parse(
        localStorage.getItem("sales")
    ) || [];


let expenses =
    JSON.parse(
        localStorage.getItem("expenses")
    ) || [];


let products =
    JSON.parse(
        localStorage.getItem("products")
    ) || [];


let customers =
    JSON.parse(
        localStorage.getItem("customers")
    ) || [];


// ==========================================
// FORMAT MONEY
// ==========================================

function money(amount) {

    return `GH₵${Number(amount).toFixed(2)}`;

}


// ==========================================
// LOAD REPORTS
// ==========================================

function loadReports() {


    // ======================================
    // TOTAL REVENUE
    // ======================================

    const revenue =
        sales.reduce(
            (
                total,
                sale
            ) =>
                total +
                Number(sale.total),
            0
        );


    // ======================================
    // TOTAL EXPENSES
    // ======================================

    const expenseTotal =
        expenses.reduce(
            (
                total,
                expense
            ) =>
                total +
                Number(expense.amount),
            0
        );


    // ======================================
    // NET PROFIT
    // ======================================

    const profit =
        revenue -
        expenseTotal;


    // ======================================
    // DISPLAY CARDS
    // ======================================

    document.getElementById(
        "reportRevenue"
    ).textContent =
        money(revenue);


    document.getElementById(
        "reportExpenses"
    ).textContent =
        money(expenseTotal);


    document.getElementById(
        "reportProfit"
    ).textContent =
        money(profit);


    document.getElementById(
        "reportOrders"
    ).textContent =
        sales.length;


    // ======================================
    // PROFIT SUMMARY
    // ======================================

    document.getElementById(
        "summaryRevenue"
    ).textContent =
        money(revenue);


    document.getElementById(
        "summaryExpenses"
    ).textContent =
        money(expenseTotal);


    document.getElementById(
        "summaryProfit"
    ).textContent =
        money(profit);


    // ======================================
    // CHART
    // ======================================

    createFinancialChart(
        revenue,
        expenseTotal
    );


    // ======================================
    // TOP PRODUCTS
    // ======================================

    generateTopProducts();


    // ======================================
    // EXPENSE CATEGORIES
    // ======================================

    generateExpenseCategories();

}


// ==========================================
// FINANCIAL BAR CHART
// ==========================================

function createFinancialChart(
    revenue,
    expenseTotal
) {

    const chart =
        document.getElementById(
            "financialChart"
        );


    chart.innerHTML = "";


    const maximum =
        Math.max(
            revenue,
            expenseTotal,
            1
        );


    const revenueHeight =
        Math.max(
            (revenue / maximum) * 170,
            10
        );


    const expenseHeight =
        Math.max(
            (expenseTotal / maximum) * 170,
            10
        );


    // REVENUE

    const revenueColumn =
        document.createElement("div");

    revenueColumn.className =
        "chart-column";


    revenueColumn.innerHTML = `

        <div class="chart-value">

            ${money(revenue)}

        </div>

        <div
            class="chart-bar revenue"
            style="height:${revenueHeight}px">

        </div>

        <div class="chart-label">

            Revenue

        </div>

    `;


    // EXPENSE

    const expenseColumn =
        document.createElement("div");

    expenseColumn.className =
        "chart-column";


    expenseColumn.innerHTML = `

        <div class="chart-value">

            ${money(expenseTotal)}

        </div>

        <div
            class="chart-bar expense"
            style="height:${expenseHeight}px">

        </div>

        <div class="chart-label">

            Expenses

        </div>

    `;


    chart.appendChild(
        revenueColumn
    );


    chart.appendChild(
        expenseColumn
    );

}


// ==========================================
// TOP PRODUCTS
// ==========================================

function generateTopProducts() {

    const table =
        document.getElementById(
            "topProductsTable"
        );


    const empty =
        document.getElementById(
            "noProductReports"
        );


    table.innerHTML = "";


    if (
        sales.length === 0
    ) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    const productStats = {};


    sales.forEach(
        sale => {

            if (
                !productStats[
                    sale.productId
                ]
            ) {

                productStats[
                    sale.productId
                ] = {

                    name:
                        sale.productName,

                    units: 0,

                    revenue: 0

                };

            }


            productStats[
                sale.productId
            ].units +=
                Number(
                    sale.quantity
                );


            productStats[
                sale.productId
            ].revenue +=
                Number(
                    sale.total
                );

        }
    );


    const topProducts =
        Object.values(
            productStats
        )
        .sort(
            (
                a,
                b
            ) =>
                b.revenue -
                a.revenue
        );


    topProducts.forEach(
        (
            product,
            index
        ) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>

                        #${index + 1}

                    </strong>

                </td>


                <td>

                    ${product.name}

                </td>


                <td>

                    ${product.units}

                </td>


                <td>

                    <strong>

                        ${money(product.revenue)}

                    </strong>

                </td>

            `;


            table.appendChild(
                row
            );

        }
    );

}


// ==========================================
// EXPENSE CATEGORIES
// ==========================================

function generateExpenseCategories() {

    const container =
        document.getElementById(
            "expenseCategories"
        );


    const empty =
        document.getElementById(
            "noExpenseReports"
        );


    container.innerHTML = "";


    if (
        expenses.length === 0
    ) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    const categories = {};


    expenses.forEach(
        expense => {

            if (
                !categories[
                    expense.category
                ]
            ) {

                categories[
                    expense.category
                ] = 0;

            }


            categories[
                expense.category
            ] +=
                Number(
                    expense.amount
                );

        }
    );


    const total =
        Object.values(
            categories
        )
        .reduce(
            (
                sum,
                amount
            ) =>
                sum +
                amount,
            0
        );


    Object.entries(
        categories
    )
    .sort(
        (
            a,
            b
        ) =>
            b[1] -
            a[1]
    )
    .forEach(
        (
            [
                category,
                amount
            ]
        ) => {

            const percentage =
                total > 0
                    ? (
                        amount /
                        total
                    ) * 100
                    : 0;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "expense-category";


            item.innerHTML = `

                <div
                    class="expense-category-top">

                    <span>

                        ${category}

                    </span>

                    <strong>

                        ${money(amount)}

                    </strong>

                </div>


                <div class="expense-progress">

                    <div
                        class="expense-progress-bar"
                        style="width:${percentage}%">

                    </div>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// ==========================================
// REFRESH
// ==========================================

document.getElementById(
    "refreshReports"
).addEventListener(
    "click",
    function () {

        sales =
            JSON.parse(
                localStorage.getItem("sales")
            ) || [];


        expenses =
            JSON.parse(
                localStorage.getItem("expenses")
            ) || [];


        products =
            JSON.parse(
                localStorage.getItem("products")
            ) || [];


        customers =
            JSON.parse(
                localStorage.getItem("customers")
            ) || [];


        loadReports();

    }
);


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

document.getElementById(
    "logoutBtn"
).addEventListener(
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
// START
// ==========================================

loadReports();
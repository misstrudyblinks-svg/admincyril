// ==========================================
// SETTINGS
// ==========================================


// AUTHENTICATION

if (
    localStorage.getItem("adminLoggedIn")
    !== "true"
) {

    window.location.href =
        "login.html";

}


// ==========================================
// DEFAULT SETTINGS
// ==========================================

const defaultSettings = {

    businessName: "BizManager",

    businessPhone: "",

    businessEmail: "",

    businessWebsite: "",

    businessAddress: "",

    businessDescription: "",

    businessLogo: "",

    currency: "GH₵",

    invoicePrefix: "INV",

    lowStock: "5",

    dateFormat: "DD/MM/YYYY",

    emailNotifications: true,

    stockNotifications: true

};


// ==========================================
// LOAD SETTINGS
// ==========================================

let settings =
    JSON.parse(
        localStorage.getItem(
            "businessSettings"
        )
    ) || defaultSettings;


// ==========================================
// ELEMENTS
// ==========================================

const businessName =
    document.getElementById(
        "businessName"
    );

const businessPhone =
    document.getElementById(
        "businessPhone"
    );

const businessEmail =
    document.getElementById(
        "businessEmail"
    );

const businessWebsite =
    document.getElementById(
        "businessWebsite"
    );

const businessAddress =
    document.getElementById(
        "businessAddress"
    );

const businessDescription =
    document.getElementById(
        "businessDescription"
    );

const businessLogo =
    document.getElementById(
        "businessLogo"
    );

const logoPreview =
    document.getElementById(
        "logoPreview"
    );


// ==========================================
// LOAD FORM
// ==========================================

function loadSettings() {

    businessName.value =
        settings.businessName || "";

    businessPhone.value =
        settings.businessPhone || "";

    businessEmail.value =
        settings.businessEmail || "";

    businessWebsite.value =
        settings.businessWebsite || "";

    businessAddress.value =
        settings.businessAddress || "";

    businessDescription.value =
        settings.businessDescription || "";


    document.getElementById(
        "currency"
    ).value =
        settings.currency ||
        "GH₵";


    document.getElementById(
        "invoicePrefix"
    ).value =
        settings.invoicePrefix ||
        "INV";


    document.getElementById(
        "lowStock"
    ).value =
        settings.lowStock ||
        "5";


    document.getElementById(
        "dateFormat"
    ).value =
        settings.dateFormat ||
        "DD/MM/YYYY";


    document.getElementById(
        "emailNotifications"
    ).checked =
        settings.emailNotifications;


    document.getElementById(
        "stockNotifications"
    ).checked =
        settings.stockNotifications;


    if (
        settings.businessLogo
    ) {

        logoPreview.innerHTML = `

            <img
                src="${settings.businessLogo}"
                alt="Business Logo">

        `;

    }

}


// ==========================================
// SAVE BUSINESS PROFILE
// ==========================================

document.getElementById(
    "businessForm"
).addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        settings.businessName =
            businessName.value.trim();


        settings.businessPhone =
            businessPhone.value.trim();


        settings.businessEmail =
            businessEmail.value.trim();


        settings.businessWebsite =
            businessWebsite.value.trim();


        settings.businessAddress =
            businessAddress.value.trim();


        settings.businessDescription =
            businessDescription.value.trim();


        saveSettings();


        alert(
            "Business profile saved successfully!"
        );

    }
);


// ==========================================
// SAVE SYSTEM SETTINGS
// ==========================================

document.getElementById(
    "systemForm"
).addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        settings.currency =
            document.getElementById(
                "currency"
            ).value;


        settings.invoicePrefix =
            document.getElementById(
                "invoicePrefix"
            ).value.trim();


        settings.lowStock =
            document.getElementById(
                "lowStock"
            ).value;


        settings.dateFormat =
            document.getElementById(
                "dateFormat"
            ).value;


        settings.emailNotifications =
            document.getElementById(
                "emailNotifications"
            ).checked;


        settings.stockNotifications =
            document.getElementById(
                "stockNotifications"
            ).checked;


        saveSettings();


        alert(
            "System preferences saved!"
        );

    }
);


// ==========================================
// LOGO UPLOAD
// ==========================================

businessLogo.addEventListener(
    "change",
    function() {

        const file =
            this.files[0];


        if (!file) return;


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select an image."
            );

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                settings.businessLogo =
                    event.target.result;


                logoPreview.innerHTML = `

                    <img
                        src="${event.target.result}"
                        alt="Business Logo">

                `;


                saveSettings();

            };


        reader.readAsDataURL(
            file
        );

    }
);


// ==========================================
// SAVE TO LOCAL STORAGE
// ==========================================

function saveSettings() {

    localStorage.setItem(
        "businessSettings",
        JSON.stringify(settings)
    );

}


// ==========================================
// RESET
// ==========================================

document.getElementById(
    "resetBusiness"
).addEventListener(
    "click",
    function() {

        if (
            !confirm(
                "Reset business profile?"
            )
        ) {

            return;

        }


        settings.businessName =
            "BizManager";

        settings.businessPhone =
            "";

        settings.businessEmail =
            "";

        settings.businessWebsite =
            "";

        settings.businessAddress =
            "";

        settings.businessDescription =
            "";

        settings.businessLogo =
            "";


        saveSettings();

        loadSettings();

    }
);


// ==========================================
// CLEAR BUSINESS DATA
// ==========================================

document.getElementById(
    "clearData"
).addEventListener(
    "click",
    function() {

        const confirmDelete =
            confirm(
                "WARNING!\n\nThis will delete your customers, products, sales, expenses and invoices.\n\nContinue?"
            );


        if (!confirmDelete) {

            return;

        }


        localStorage.removeItem(
            "customers"
        );

        localStorage.removeItem(
            "products"
        );

        localStorage.removeItem(
            "sales"
        );

        localStorage.removeItem(
            "expenses"
        );

        localStorage.removeItem(
            "invoices"
        );


        alert(
            "Business data has been cleared."
        );

    }
);


// ==========================================
// MOBILE SIDEBAR
// ==========================================

document.getElementById(
    "menuToggle"
).addEventListener(
    "click",
    function() {

        document.getElementById(
            "sidebar"
        ).classList.toggle(
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


// ==========================================
// START
// ==========================================

loadSettings();
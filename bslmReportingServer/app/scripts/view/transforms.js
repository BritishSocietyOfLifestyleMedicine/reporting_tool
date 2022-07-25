'use strict';

const getElement = id => document.getElementById(id);

const hideLoginBar = () => {
    getElement('loadingPage').style.display = 'none';
    getElement('pageWrapper').style.display = 'flex';
}

const showProgress = type => {
    getElement('progressWrapper').style.display = 'flex';

    if (type == 'users') getElement('numUsersFetched').style.display = 'inline';
    if (type == 'payments') getElement('numPaymentsFetched').style.display = 'inline';

}

const showLoadingScreen = () => {
    getElement('loginPage').style.display = 'none';
    getElement('loadingPage').style.display = 'flex';
}

const showLoginPage = () => {
    getElement('loadingPage').style.display = 'none';
    getElement('loginPage').style.display = 'flex';
}

const showErrorInfo = err => {
    getElement('showErrorInfo').style.display = 'flex';
    getElement('showErrorInfo').innerHTML = `<p>${err.display_error}\n</p>`;
    showLoginPage();
}

const updateUsersProgress = numUsers => getElement('numUsersFetched').innerHTML = numUsers;

const updatePaymentsProgress = numPayments => getElement('numPaymentsFetched').innerHTML = numPayments;

const showError = err => {
    getElement('errorWrapper').innerHTML = `<p>${err.message}</p>`;
    getElement('errorWrapper').style.display = 'flex';
}

const replaceCssClass = (element, newClass, oldClass) => {
    element.classList.remove(oldClass);
    element.classList.add(newClass);
}


const showUserTable = () => {
    getElement('userTableWrapper').style.display = 'flex';
    getElement('paymentsTableWrapper').style.display = 'none';
    getElement('susUserTableWrapper').style.display = 'none';
    replaceCssClass(getElement('usersTabInput'), 'inputSwitchGreen', 'inputSwitchWhite');
    replaceCssClass(getElement('paymentsTabInput'), 'inputSwitchWhite', 'inputSwitchGreen');
    replaceCssClass(getElement('susTabInput'), 'inputSwitchWhite', 'inputSwitchGreen');
    updateScrollToTopButton();
    getElement('downloadCsvBtn').style.display = 'inherit';
}

const showPaymentsTable = () => {
    getElement('userTableWrapper').style.display = 'none';
    getElement('paymentsTableWrapper').style.display = 'flex';
    getElement('susUserTableWrapper').style.display = 'none';
    replaceCssClass(getElement('usersTabInput'), 'inputSwitchWhite', 'inputSwitchGreen');
    replaceCssClass(getElement('paymentsTabInput'), 'inputSwitchGreen', 'inputSwitchWhite');
    replaceCssClass(getElement('susTabInput'), 'inputSwitchWhite', 'inputSwitchGreen');
    updateScrollToTopButton();
    getElement('downloadCsvBtn').style.display = 'inherit';
}

const showSusUsersTable = () => {
    getElement('userTableWrapper').style.display = 'none';
    getElement('paymentsTableWrapper').style.display = 'none';
    getElement('susUserTableWrapper').style.display = 'flex';
    replaceCssClass(getElement('usersTabInput'), 'inputSwitchWhite', 'inputSwitchGreen');
    replaceCssClass(getElement('paymentsTabInput'), 'inputSwitchWhite', 'inputSwitchGreen');
    replaceCssClass(getElement('susTabInput'), 'inputSwitchGreen', 'inputSwitchWhite');
    getElement('downloadCsvBtn').style.display = 'none';
}

const getSelectedTable = () => {
    if (getElement('userTableWrapper').style.display == 'flex' || getElement('userTableWrapper').style.display == '')
        return 'USERS_TABLE';
    else if (getElement('paymentsTableWrapper').style.display == 'flex') return 'PAYMENTS_TABLE';
    else return 'SUS_USER_TABLE';
}

const showGetUserForm = () => {
    replaceCssClass(getElement('usersInputSwitchGreen'), 'inputSwitchGreen', 'inputSwitchWhite');
    replaceCssClass(getElement('usersInputSwitchRed'), 'inputSwitchWhite', 'inputSwitchRed');
    getElement('getUsersForm').style.display = 'flex';
};

const hideGetUserForm = () => {
    replaceCssClass(getElement('usersInputSwitchGreen'), 'inputSwitchWhite', 'inputSwitchGreen');
    replaceCssClass(getElement('usersInputSwitchRed'), 'inputSwitchRed', 'inputSwitchWhite');
    getElement('getUsersForm').style.display = 'none';
};

const showGetPaymentForm = () => {
    replaceCssClass(getElement('paymentInputSwitchAll'), 'inputSwitchGreen', 'inputSwitchWhite');
    replaceCssClass(getElement('paymentInputSwitchAfter'), 'inputSwitchWhite', 'inputSwitchGreen');
    replaceCssClass(getElement('paymentInputSwitchNone'), 'inputSwitchWhite', 'inputSwitchRed');
    getElement('getPaymentsForm').style.display = 'flex';
    getElement('paymentsAfterField').style.display = 'none';
};

const showGetPaymentFormWDatepicker = () => {
    replaceCssClass(getElement('paymentInputSwitchAll'), 'inputSwitchWhite', 'inputSwitchGreen');
    replaceCssClass(getElement('paymentInputSwitchAfter'), 'inputSwitchGreen', 'inputSwitchWhite');
    replaceCssClass(getElement('paymentInputSwitchNone'), 'inputSwitchWhite', 'inputSwitchRed');
    getElement('getPaymentsForm').style.display = 'flex';
    getElement('paymentsAfterField').style.display = 'flex';
};

const hideGetPaymentForm = () => {
    replaceCssClass(getElement('paymentInputSwitchAll'), 'inputSwitchWhite', 'inputSwitchGreen');
    replaceCssClass(getElement('paymentInputSwitchAfter'), 'inputSwitchWhite', 'inputSwitchGreen');
    replaceCssClass(getElement('paymentInputSwitchNone'), 'inputSwitchRed', 'inputSwitchWhite');
    getElement('getPaymentsForm').style.display = 'none';
};


const showGetBsUsersForm = () => {
    replaceCssClass(getElement('bsUsersInputSwitchGreen'), 'inputSwitchGreen', 'inputSwitchWhite');
    replaceCssClass(getElement('bsUsersInputSwitchRed'), 'inputSwitchWhite', 'inputSwitchRed');
    getElement('getBrightspaceUsersForm').style.display = 'flex';
}

const hideGetBsUsersForm = () => {
    replaceCssClass(getElement('bsUsersInputSwitchGreen'), 'inputSwitchWhite', 'inputSwitchGreen');
    replaceCssClass(getElement('bsUsersInputSwitchRed'), 'inputSwitchRed', 'inputSwitchWhite');
    getElement('getBrightspaceUsersForm').style.display = 'none';
}


const showGettingBsToken = () => {
    getElement('getBsUsersBtn').style.display = 'none';
    getElement('bsTokenStatusInfo').style.display = 'flex';
    getElement('bsTokenStatusInfo').innerHTML = 'Logging into Brightspace...';
}

const showAcquiredBsToken = () => {
    getElement('bsTokenStatusInfo').innerHTML = 'Logged into Brightspace';
}

const showBsLoginButton = () => {
    getElement('getBsUsersBtn').style.display = 'flex';
    getElement('bsTokenStatusInfo').style.display = 'none';
}

const openModal = user => {
    getElement('modal').innerHTML = '';
    addElement(getElement('modal'), modalUserTemplate(user));
    getElement('modalBacksplash').style.display = 'inline';
}

const closeModal = () => getElement('modalBacksplash').style.display = 'none';

// curried for use in template
const toggleSusUserList = susListElement => () => {
    if (susListElement.style.display == 'none')
        susListElement.style.display = 'block';
    else
        susListElement.style.display = 'none';
}

const scrollToTop = scrollableElement => scrollableElement.scrollTo({
    top: 0,
    behavior: 'smooth'
});

const updateScrollToTopButton = () => {
    const scrollBtn = getElement('backToTopBtn');
    if(getSelectedTable() == 'USERS_TABLE') scrollBtn.onclick = () => scrollToTop(getElement('userScrollWrapper'));
    if(getSelectedTable() == 'PAYMENTS_TABLE') scrollBtn.onclick = () => scrollToTop(getElement('paymentScrollWrapper'));
    if(getSelectedTable() == 'SUS_USER_TABLE') scrollBtn.onclick = () => scrollToTop(getElement('susUserTableWrapper'));
}

const cancelClick = e => e.stopPropagation();
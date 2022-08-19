'use strict';

const displayInfo = (userList, paymentList, storeJson) => {

    console.log(userList.users);

    const findUserFromPayment = payment => {
        const userByCustId = userList.users.find(user => user.customer_id === payment.customer_id);
        if (userByCustId !== undefined) return userByCustId;

        const userByUsername = userList.users.find(user => user.username === payment.receipt_email);
        console.log('Customer ID of payment does not match user');
        console.log(userByUsername);
        return userByUsername;
    }

    updateScrollToTopButton();

    getElement('downloadCsvBtn').onclick = () => {
        const selectedTable = getSelectedTable();
        selectedTable == 'USERS_TABLE' ? downloadInfoCsv(userList.dataStoreFormat(), 'bslm_user_list') :
            downloadInfoCsv(paymentList, 'bslm_payment_history');
    }

    const userTableWrapper = getElement('userTableDynamicContent');
    addElement(getElement('userTableHeadings'), userTitlesTemplate());
    userList.users.forEach((user, i) => addElement(userTableWrapper, userTemplate(user, i)));

    const paymentTableWrapper = getElement('paymentsTableDynamicContent');
    addElement(getElement('paymentTableHeadings'), paymentTitlesTemplate());
    paymentList.forEach((payment, i) => addElement(paymentTableWrapper, paymentTemplate(payment, i, findUserFromPayment)));

    findListsOfInterest(userList.users).forEach(susUserList => {
        const susListWrapper = addElement(getElement('susUserTableDynamicContent'), susUserListTitleTemplate(susUserList));
        addElement(susListWrapper, userTitlesTemplate());
        susUserList.users.forEach((user, i) => addElement(susListWrapper, userTemplate(user, i)));
    });

    hideLoginBar();
}


const displayDashBoard = ({userList = 'offline', paymentList = 'offline', storeFileList}) => {
    hideLoginPage();
    showDashBoardPage();
    drawGraphs(storeFileList);
    
}



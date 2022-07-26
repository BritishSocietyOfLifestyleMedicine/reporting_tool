/**
 * @author Max Aitkenhead
 */

"use strict";

const main = async () => {

    //add in loading symbol for this
    const storedCredentials = await fetchCreds();
    console.log(storedCredentials)
    const initPromises = await Promise.all([
        getStoreFileList(),
        waitForButton('getBsUsersBtn', getBsTokenEvent(storedCredentials.brightspaceAuth))
    ]);

    //make login page reset for when proms fail
    const storeFileList = initPromises[0];
    const brightspaceToken = initPromises[1];

    await waitForButton('getUsersBtn');

    // fix form validation for new workflow;
    const formData = validateLoginForm();
    if (formData.fail) return;

    showLoadingScreen();

    const stripeCheckDate = storeFileList.payments.length ? storeFileList.payments[0].date_created : null;

    const apiResponses = await Promise.all([
        getWpUsers(formData.wpUsername, formData.wpPassword),
        getPayments(storedCredentials.stripeAuth, stripeCheckDate),
        getBrightspaceUsers(brightspaceToken)
    ]).catch(err => showErrorInfo(err));

    if (apiResponses === undefined) return;

    const wpUsers = apiResponses[0];
    const newPaymentsList = apiResponses[1];
    const brightspaceUsers = apiResponses[2];

    setFormData(formData);

    // move buildpaymentlist() to payment list model
    const fullPaymentList = buildPaymentsList(storeFileList.payments, newPaymentsList);
    Object.freeze(fullPaymentList);

    const userList = new UserList({}).addWpData(wpUsers, 'username').addPayments(fullPaymentList)
        .addBrightspaceData(brightspaceUsers);

    console.log(userList.users);

    updateStoreFile(storeFileList, userList, fullPaymentList);

    displayInfo(userList, fullPaymentList);

}
main();



const showExistingData = async () => {
    showLoadingScreen();
    const storeFileList = await getStoreFileList();
    Object.freeze(storeFileList);

    console.log(storeFileList);

    const lastStoredUserBuild = buildUserSnapShot(storeFileList.userDiffs);

    // const usersWithPayments = combinePayments(lastStoredUserBuild, storeFileList.payments);
    // Object.freeze(usersWithPayments);

    const userList = new UserList({}).addWpData(lastStoredUserBuild, 'username').addPayments(storeFileList.payments);

    hideLoginBar();
    displayInfo(userList, storeFileList.payments)
}











/**
 * @author Max Aitkenhead
 */

"use strict";

const main = async () => {

    //add in loading symbol for this
    const storedCredentials = await fetchCreds();

    const initPromises = await Promise.all([
        waitForButton('getBsUsersBtn', getBrightspaceToken, storedCredentials.brightspaceAuth),
        // waitForButton('getZoomDataBtn', getZoomToken, storedCredentials.zoomAuth)
    ]);

    //make login page reset for when proms fail
    const brightspaceToken = initPromises[0];
    const zoomRefreshCode = initPromises[2];

    await waitForButton('getUsersBtn');

    // fix form validation for new workflow;
    const formData = validateLoginForm();
    if (formData.fail) return;

    // showLoadingScreen();
    const storeFileList = await getStoreFileList();
    
    const apiResponses = await Promise.all([
        getWpUsers(formData.wpUsername, formData.wpPassword),
        getPayments(storedCredentials.stripeAuth, storeFileList.payments[0].date_created),
        getBrightspaceUsers(brightspaceToken),
        // getZoomData(zoomRefreshCode, storedCredentials.zoomAuth)
        // campaign monitor 
        ]).catch(err => showErrorInfo(err));

    if (apiResponses === undefined) return;

    const wpUsers = apiResponses[0];
    const newPaymentsList = apiResponses[1];
    const brightspaceUsers = apiResponses[2];

    setFormData(formData);

    const paymentList = new PaymentList({}).buildPaymentsList(storeFileList.payments, newPaymentsList);

    const userList = new UserList({}).addWpData(wpUsers, 'username').addPayments(paymentList) //add all data together for single list of users
        .addBrightspaceData(brightspaceUsers);

    console.log(userList.users);

    const newStoreJson = updateStoreFile(storeFileList, userList, paymentList);  // update the store file with new payment and user data
    console.log(newStoreJson);

    displayInfo(userList, paymentList.payments, newStoreJson);

    // displayDashBoard(userList, paymentList, newStoreJson);

}
// main();



const showExistingData = async () => {
    showLoadingScreen();
    const storeFileList = await getStoreFileList();
    console.log(storeFileList)
    const lastStoredUserBuild = buildLatestStoredSnapshotTest(storeFileList);
    const paymentsList = storeFileList.payments;
    displayDashBoard(lastStoredUserBuild, paymentsList, storeFileList);

    // console.log(lastStoredUserBuild);

    // const usersWithPayments = combinePayments(lastStoredUserBuild, storeFileList.payments);
    // Object.freeze(usersWithPayments);

    // const userList = new UserList({}).addWpData(lastStoredUserBuild, 'username').addPayments(storeFileList.payments);

//     hideLoginBar();
//     displayInfo(userList, storeFileList.payments)

    // displayDashBoard({
    //     storeFileList: storeFileList
    // });

}
showExistingData();



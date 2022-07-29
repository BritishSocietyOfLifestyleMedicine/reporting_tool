"use strict";

const getWpUsers = async (inputUsername, inputPassword) => {
    const token = await getWpToken(inputUsername, inputPassword);
    showProgress('users');
    const userList = await getWpUserData(token);
    return userList;
};

const getWpToken = async (inputUsername, inputPassword) => {
    const response = await fetch("https://bslm.org.uk/wp-json/jwt-auth/v1/token", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: inputUsername,
            password: inputPassword
        })
    });
    const json = await response.json();
    if (json.hasOwnProperty('data') && json.data.status === 403)
        throw appendErrMsg(json, 'Incorrect wordpress username or password');
    return json.token;
}


const getWpUserData = async token => {
    const fetchWpUserRecur = async (usersAcc = []) => {
        updateUsersProgress(usersAcc.length);
        const response = await fetch(`https://bslm.org.uk/wp-json/wp/v2/users?per_page=100&offset=${usersAcc.length}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => {
            reject(appendErrMsg(err, 'Bad Wordpress users fetch'));
            return false;
        })
        if (!response) return;
        const json = await response.json();
        if (json.hasOwnProperty('data') && json.data.status !== 200) throw appendErrMsg(json, 'Bad wordpress token');
        else if (usersAcc.length % 100 != 0) return usersAcc.concat(tidyWpUsersList(json));
        else return fetchWpUserRecur(usersAcc.concat(tidyWpUsersList(json)));
    }
    return await fetchWpUserRecur();
}

const tidyWpUsersList = userdata => userdata.map(user => ({
    id: getUserObjProp(user, 'id'),
    email: getUserObjProp(user.userData.data, 'user_email'),
    title: getUserObjProp(user.metadata, 'title'),
    first_name: getUserObjProp(user.metadata, 'first_name'),
    last_name: getUserObjProp(user.metadata, 'last_name'),
    profession: getUserObjProp(user.metadata, 'profession'),
    membership_type: getMembershipType(getUserObjProp(user.metadata, 'wp_capabilities')),
    date_registered: new Date(getUserObjProp(user.userData.data, 'user_registered')),
    telephone: getUserObjProp(user.metadata, 'telephone'),
    mailing_address: getUserObjProp(user.metadata, 'mailing_address'),
    paid_to_date: unixTsToDate(getUserObjProp(user.metadata, 'subscription_end_date')),
    date_last_logged_in: unixTsToDate(getUserObjProp(user.metadata, 'wfls-last-login')),
    username: getUserObjProp(user.userData.data, 'user_login'),
    customer_id: getUserObjProp(user.metadata, 'customer_id'),
    certificate_type: getCertType(getUserObjProp(user.metadata, 'certificate_type')),
    certificate_date: unixTsToDate(getUserObjProp(user.metadata, 'certificate_registration_date')),
    share_phone_number: getUserObjProp(user.metadata, 'share_phone_number'),
    // raw_object: JSON.stringify(user)
}));

const getUserObjProp = (obj, propStr) => {
    const prop = obj[propStr];
    const removePropFromArray = prop => Array.isArray(prop) ? prop[0] : prop;
    const checkPropDefined = prop => prop === null || prop === undefined ? '' : prop;
    return checkPropDefined(removePropFromArray(prop));
}

const getMembershipType = wp_capabilities => {
    if (wp_capabilities == '') return '';
    const membershipTypes = [
        ['full_membership', 'Full Member'],
        ['legacy_membership', 'Legacy Member'],
        ['student_membership', 'Student Member'],
        ['associate_membership', 'Associate Member'],
        ['free_membership', 'Honorary Member'],
        ['applicant', 'Applicant Member'],
        ['subscriber_membership', 'Subscriber'],
        ['editor', 'Editor'],
        ['admin', 'Administrator'],
        ['none', 'None']
    ]
    const membershipType = membershipTypes.filter(type => wp_capabilities.includes(type[0]));
    return membershipType.length === 0 ? 'None' : membershipType[0][1];
}

const getCertType = certStr => {
    if (certStr == "cert_type_1") return 'Certified Physician';
    if (certStr == "cert_type_2") return 'Certified Professional';
    if (certStr == "cert_type_3") return 'Certified Practitioner';
    return '';
}


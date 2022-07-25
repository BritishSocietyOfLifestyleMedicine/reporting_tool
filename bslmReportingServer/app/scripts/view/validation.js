"use strict";

const validateLoginForm = () => {
    clearValidation();

    const checkWpUsername = check(getElement('usernameInput'), element => element.value == '');
    const checkWpPassword = check(getElement('passwordInput'), element => element.value == '');

    const failedChecks = [checkWpUsername, checkWpPassword]
        .filter(check => check.checkFail(check.element));

    failedChecks.forEach(check => showInputFieldError(check.element))

    if (failedChecks.length) return { fail: true }

    return {
        wpUsername: getElement('usernameInput').value,
        wpPassword: getElement('passwordInput').value,
        saveFormData: getElement('rememberLoginCheckbox').value
    }
}

const showInputFieldError = input => {
    console.log(input);
    input.style.border = '3px red solid';
    return true;
};

const clearValidation = () =>
    [...getElement('loginPage').getElementsByTagName('input')].forEach(input => input.style.borderColor = 'black');

const check = (element, checkFail) => ({
    element: element,
    checkFail: checkFail
})

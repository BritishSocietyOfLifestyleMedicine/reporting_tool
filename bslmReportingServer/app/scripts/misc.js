'use strict';

const waitForButton = (buttonElementId, func = () => { }, params = '') => {
    const buttonElement = document.getElementById(buttonElementId);

    const wrapPromise = (resolve, reject) => {
        try {
            resolve(func(params))
        } catch (err) {
            reject(err);
        }
    }

    return new Promise((resolve, reject) =>
        buttonElement.addEventListener('click', () => wrapPromise(resolve, reject)));
}

const unixTsToDateStr = unixTs => unixTs == '' ? '' : new Date(unixTs * 1000).toLocaleDateString('en-GB');

const unixTsToDate = unixTs => unixTs == '' ? '' : new Date(unixTs * 1000);

const dateToStr = date => {
    const day = date.getDate() < 10 ? '0' + date.getDate().toString() : date.getDate().toString();
    const month = date.getMonth() < 10 ? '0' + date.getMonth().toString() : date.getMonth().toString();
    const year = (date.getFullYear() - 2000).toString();
    return `${day}/${month}/${year}`
}

const newErrMsg = displayErr => ({
    failed: true,
    display_error: displayErr
})

const appendErrMsg = (errObj, displayErr) => ({
    failed: true,
    display_error: displayErr,
    ...errObj
})
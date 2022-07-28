"use strict";

const stripeUrlBase = 'https://api.stripe.com/v1/charges?limit=100';

const getPayments = async (storedStripeCreds, paymentsAfterDate = new Date(1970)) => {
    showProgress('payments');
    const chargeList = await getPaymentData(storedStripeCreds.apiKey, paymentsAfterDate);
    return chargeList;
}

const getPaymentData = async (stripeKey, paymentsAfterDate) => {

    const fetchChargesRecur = async (startAfterId = '', chargesAcc = []) => {
        updatePaymentsProgress(chargesAcc.length);
        const url = startAfterId === '' ? stripeUrlBase : stripeUrlBase + `&starting_after=${startAfterId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${stripeKey}`
            }
        }).catch(err => {
            reject(appendErrMsg(err, 'Bad payments fetch'));
            return false;
        })
        if (!response) return;
        const chargesResponse = await response.json();
        if (chargesResponse.hasOwnProperty('error')) throw appendErrMsg(chargesResponse.error, 'Incorrect Stripe key');
        else if (chargesResponse.data.length < 100) return chargesAcc.concat(tidyPaymentData(chargesResponse.data));
        else if (unixTsToDate(chargesResponse.data.at(-1).created) < paymentsAfterDate)
            return chargesAcc.concat(tidyPaymentData(chargesResponse.data));
        return fetchChargesRecur(chargesResponse.data.at(-1).id, chargesAcc.concat(tidyPaymentData(chargesResponse.data)));
    }
    
    return await fetchChargesRecur();
}

const tidyPaymentData = chargesData => chargesData.map(charge => ({
    customer_id: getPaymentObjProp(charge, 'customer'),
    amount: getPaymentObjProp(charge, 'amount'),
    billing_details: getPaymentObjProp(charge, 'billing_detail'),
    date_created: unixTsToDate(getPaymentObjProp(charge, 'created')),
    currency: getPaymentObjProp(charge, 'currency'),
    description: getPaymentObjProp(charge, 'description'),
    customer_description: getPaymentObjProp(charge.metadata, 'sc_cf_radio_1'),
    failure_message: getPaymentObjProp(charge, 'failure_message'),
    card_hash: getPaymentObjProp(charge.payment_method_details, 'fingerprint'),
    receipt_email: getPaymentObjProp(charge, 'receipt_email'),
    receipt_url: getPaymentObjProp(charge, 'receipt_url'),
    payment_status: getPaymentObjProp(charge, 'status')
}));

const getPaymentObjProp = (obj, propStr) => obj.hasOwnProperty(propStr) && obj[propStr] != null ? obj[propStr] : '';



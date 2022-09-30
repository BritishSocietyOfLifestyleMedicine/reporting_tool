'use strict'

class PaymentList {
    constructor({paymentArray = []}) {
        this.payments = paymentArray;
    }

    /**
    * Removes any overlap between new and old payments and combines into one list
    * @param {Array} storeFileListPayments - List of payments already stored
    * @param {Array} downloadedPaymentList - List of new payments
    * @returns {Array} - Complete payment list
    */
    buildPaymentsList = (storeFileListPayments, downloadedPaymentList) => {
        if (!storeFileListPayments.length) return downloadedPaymentList;
        const newPaymentList = 
            downloadedPaymentList.filter(payment => payment.date_created > storeFileListPayments[0].date_created)
        return new PaymentList({paymentArray: [...newPaymentList, ...storeFileListPayments]});
    }
}


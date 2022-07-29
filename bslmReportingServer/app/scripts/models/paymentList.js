'use strict'

class PaymentList {
    constructor(paymentArray = []) {
        this.payment = paymentArray;
    }

    addPaymentData = data => {
        const recAddPaymentData = (i = 0, accPaymentList = []) => {
            if (i === data.length) return { paymentArray: accPaymentList };
            return recAddPaymentData(i + 1, [...accPaymentList, Payment.newPayment(data[i])]);
        }
        return paymentList.newPaymentList(recAddPaymentData(0, this.payment));
    }

    static newPaymentList = ({ paymentArray = []}) => {
        const newPaymentList = new UserList({ paymentArray: paymentArray});
        Object.freeze(newPaymentList);
        return newPaymentList;
    }
    /**
    * Removes any overlap between new and old payments and combines into one list
    * @param {Array} storeFileListPayments - List of payments already stored
    * @param {Array} downloadedPaymentList - List of new payments
    * @returns {Array} - Complete payment list
    */
    buildPaymentsList = (storeFileListPayments, downloadedPaymentList) => {
        if (!storeFileListPayments.length) return downloadedPaymentList;
        const newPaymentList = downloadedPaymentList.filter(payment => payment.date_created > storeFileListPayments[0].date_created)
        return new PaymentList([...newPaymentList, ...storeFileListPayments]);
    }
}


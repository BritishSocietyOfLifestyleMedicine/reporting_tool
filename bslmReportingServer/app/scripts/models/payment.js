'use strict'

class Payment {

    constructor({customer_id = '', amount = '', billing_details = '', date_created = '', currency = '', description = '', customer_description = '', 
    failure_message = '', card_hash = '', receipt_email = '', receipt_url = '', payment_status = ''}) {
        //stripe payment attributes
        this.customer_id = customer_id;
        this.amount = amount;
        this.billing_details = billing_details;
        this.date_created = date_created;
        this.currency = currency;
        this.description = description;
        this.customer_description = customer_description;
        this.failure_message = failure_message;
        this.card_hash = card_hash;
        this.receipt_email = receipt_email;
        this.receipt_url = receipt_url;
        this.payment_status = payment_status;
    }

    // setNewPaymentAttributes = object => {
    //     const newObj = new Payment({ ...this, ...object })
    //     Object.freeze(newObj);
    //     return newObj;
    // }

    // static newPayment = props => {
    //     const newUser = new Payment(props);
    //     Object.freeze(newUser);
    //     return newUser;
    // }

}
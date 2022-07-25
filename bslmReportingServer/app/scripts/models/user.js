'use strict';

class User {

    constructor({ id = '', email = '', title = '', first_name = '', last_name = '', profession = '', membership_type = '', 
        date_registered = '', telephone = '', mailing_address = '', paid_to_date = '', date_last_logged_in = '', 
        username = '', customer_id = '', certificate_type = '', certificate_date = '', share_phone_number = '', 
        payments = [], bs_id = '', bs_last_accessed_date = '', bs_enrolled_courses = [] }) {
        // wordpress attributes
        this.email = email;
        this.id = id;
        this.title = title;
        this.first_name = first_name;
        this.last_name = last_name;
        this.profession = profession;
        this.membership_type = membership_type;
        this.date_registered = date_registered;
        this.telephone = telephone;
        this.mailing_address = mailing_address;
        this.paid_to_date = paid_to_date;
        this.date_last_logged_in = date_last_logged_in;
        this.username = username;
        this.customer_id = customer_id;
        this.certificate_type = certificate_type;
        this.certificate_date = certificate_date;
        this.share_phone_number = share_phone_number;
        // stripe attributes
        this.payments = payments;
        // brightspace attributes
        this.bs_id = bs_id;
        this.bs_last_accessed_date = bs_last_accessed_date;
        this.bs_enrolled_courses = bs_enrolled_courses;
    }

    setNewAttributes = object => {
        const newObj = new User({ ...this, ...object })
        Object.freeze(newObj);
        return newObj;
    }

    static newUser = props => {
        const newUser = new User(props);
        Object.freeze(newUser);
        return newUser;
    }

    saveFormat = () => {
        const recGetSaveUser = (entries, accSaveUser = {}) => {
            if (!entries.length) return accSaveUser;
            return recGetSaveUser(entries.slice(1), {
                ...accSaveUser,
                [entries[0][0]]: entries[0][1]
            });
        }
        const filterFunctions = Object.entries(this).filter(entry => !(entry[1] instanceof Function) && entry[0] !== 'payments');
        return recGetSaveUser(filterFunctions);
    }

}

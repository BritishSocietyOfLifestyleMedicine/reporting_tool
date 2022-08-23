'use strict';

class UserList {

    constructor(userArray = []) {
        this.users = userArray;
    }

    /**
     * Initalises a new UserList, wordpress data should be the first thing added.  
     * Map wordpress user list to a new userlist object
     * @param {Array} wordPressData - Array of users taken from fetchWpUsers.js
     * @returns {UserList} - List of users only populated with data from wordpress
     */
    addWpData = wordPressData => new UserList(wordPressData.map(wpd => User.newUser(wpd)));

    /**
     * Takes an existing UserList and adds payment data
     * Find any payments matching a user and adds them to the user object
     * @param {Array} paymentList - List of Stripe payments from fetchPayments.js
     * @returns {UserList} - List of users with added payment info
     */
    addPayments = paymentList => new UserList(this.users.map(user => {
        // payments matching the user
        const matchingPayments = paymentList.payments.filter(payment => 
            user.customer_id === payment.customer_id && payment.customer_id !== '' ||
            user.username === payment.receipt_email && payment.receipt_email !== '' ||
            user.email === payment.receipt_email && payment.receipt_email !== '')
        
        if (matchingPayments === undefined || !matchingPayments.length) return user;

        return user.setNewAttributes({ payments: matchingPayments })

    }))

    /**
     * Takes an existing UserList and adds Brighspace data
     * Finds brightspace account that matched the user object and adds the brightspace data to 
     * that user account
     * @param {Array} brightspaceData - List of brightspace accounts from fetchBrightspaceUsers.js
     * @returns {UserList} - List of users updated with brightspace info
     */
    addBrightspaceData = brightspaceData => new UserList(this.users.map(user => {
        const matchingBsData = 
            brightspaceData.find(bsData => bsData.UserName.toLowerCase() === user.username.toLowerCase());

        if (matchingBsData === undefined) return user
        return user.setNewAttributes({
            bs_id: matchingBsData.UserId,
            bs_last_accessed_date: matchingBsData.LastAccessedDate === '' ? '' :
                new Date(matchingBsData.LastAccessedDate),
            bs_enrolled_courses: matchingBsData.enrolledCourses
        })
    })) 
    
    // sets userlist as ready to be exported or saved
    dataStoreFormat = () => this.users.map(user => user.saveFormat());

}


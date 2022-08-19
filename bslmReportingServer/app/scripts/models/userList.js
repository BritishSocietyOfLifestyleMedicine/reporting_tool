'use strict';

class UserList {

    constructor(userArray = []) {
        this.users = userArray;
        // this.paymentsWithoutWpAccount = paymentsWithoutWpAccount;
        // this.bsAccountsWithoutWpAccount = bsAccountsWithoutWpAccount;
    }

    addWpData = data => {
        const recAddWpData = (i = 0, accUserList = []) => {
            if (i === data.length) return { userArray: accUserList };
            return recAddWpData(i + 1, [...accUserList, User.newUser(data[i])]);
        }
        return UserList.newUserList(recAddWpData(0, this.users));
    }

    addPayments = paymentList => {

        let accUserList = this.users;
        let accPaymentsWithoutWpAccount = this.paymentsWithoutWpAccount;
        for (let i = 0; i < paymentList.length; i++) {

            const matchingUsers = this.#findUser(
                user => (user.customer_id === paymentList[i].customer_id && paymentList[i].customer_id !== '' ||
                    paymentList[i].receipt_email === user.username && paymentList[i].receipt_email !== '' ||
                    paymentList[i].receipt_email === user.email) && paymentList[i].receipt_email !== '', true
            );

            if (matchingUsers === undefined || !matchingUsers.length || paymentList[i].customer_id !== '') {
                accPaymentsWithoutWpAccount = [...accPaymentsWithoutWpAccount, paymentList[i]];
                continue;
            }

            matchingUsers.forEach(matchingUser => {
                const userWithPayment = matchingUser.user.setNewAttributes({
                    payments: [...matchingUser.user.payments, paymentList[i]]
                })
                arrayReplaceElement(accUserList, userWithPayment, matchingUser.index)
            })
        }
        return UserList.newUserList(userArray);
    }

    addBrightspaceData = brightspaceData => {

        return Userlist.newUserList(this.users.map(user => {
            const matchingBsData = brightspaceData.find(bsData => bsData.UserName.toLowerCase() === user.username.toLowerCase());

            if (matchingBsData === undefined) return user
            return user.setNewAttributes({
                bs_id: matchingBsData.UserId,
                bs_last_accessed_date: matchingBsData.LastAccessedDate === '' ? '' :
                    new Date(matchingBsData.LastAccessedDate),
                bs_enrolled_courses: matchingBsData.enrolledCourses
            })

        }))

        // console.log(this.users.filter(user => this.users.filter(u2 => u2.id === user.id).length > 1));

        // const recAddBrightspaceData = (i = 0, accUserList = this.users,
        //     accBsUsersWithoutWpAccount = this.bsAccountsWithoutWpAccount) => {

        //     if (i === brightspaceData.length) return {
        //         userArray: accUserList,
        //         bsAccountsWithoutWpAccount: accBsUsersWithoutWpAccount
        //     }

        //     const matchingUser = this.#findUser(user => user.username.toLowerCase() === brightspaceData[i].UserName.toLowerCase(), false);

        //     if (matchingUser !== undefined) {
        //         const updatedUser = {
        //             bs_id: brightspaceData[i].UserId,
        //             bs_last_accessed_date: brightspaceData[i].LastAccessedDate === '' ? '' :
        //                 new Date(brightspaceData[i].LastAccessedDate),
        //             bs_enrolled_courses: brightspaceData[i].enrolledCourses
        //         }
        //         return recAddBrightspaceData(i + 1, arrayReplaceElement(accUserList,
        //             matchingUser.user.setNewAttributes(updatedUser), matchingUser.index));
        //     }
        //     return recAddBrightspaceData(i + 1, accUserList, [...accBsUsersWithoutWpAccount, brightspaceData[i]]);
        // }
        // return UserList.newUserList(recAddBrightspaceData());
    }

    #findUser = (predicate, findMultiple = false) => {

        const matchingUsers = this.users.filter(predicate).map((user, i) => ({
            index: i,
            user: user
        }));
        if (findMultiple) return matchingUsers;
        if (matchingUsers.length > 1)
            throw newErrMsg('Too many items found');
        return matchingUsers[0];
    }

    static newUserList = (userArray = []) => {
        const newUserList = new UserList(userArray);
        Object.freeze(newUserList);
        return newUserList;
    }

    dataStoreFormat = () => this.users.map(user => user.saveFormat());




}


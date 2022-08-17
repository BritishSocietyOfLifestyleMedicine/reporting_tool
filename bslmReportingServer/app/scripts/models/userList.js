'use strict';

class UserList {

    constructor({ userArray = [], paymentsWithoutWpAccount = [], bsAccountsWithoutWpAccount = [] }) {
        this.users = userArray;
        this.paymentsWithoutWpAccount = paymentsWithoutWpAccount;
        this.bsAccountsWithoutWpAccount = bsAccountsWithoutWpAccount;
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
            if (i >= paymentList.length) return

            if (paymentList[i].customer_id !== '') {
                accPaymentsWithoutWpAccount = [...accPaymentsWithoutWpAccount, paymentList[i]];
                continue;
            }

            const matchingUsers = this.#findUser(
                user => user.customer_id === paymentList[i].customer_id ||
                    paymentList[i].receipt_email === user.username ||
                    paymentList[i].receipt_email === user.email, true
            );

            if (matchingUsers === undefined || !matchingUsers.length) {
                accPaymentsWithoutWpAccount = [...accPaymentsWithoutWpAccount, paymentList[i]];
                continue;
            }

            const recUpdateMatchingUsers = (j = 0, accMatchingUserList = accUserList) => {
                if (j === matchingUsers.length) return accMatchingUserList;
                const updatedUser = {
                    ...matchingUsers[j].user,
                    payments: [...matchingUsers[j].user.payments, paymentList[j]]
                }
                return recUpdateMatchingUsers(j + 1,
                    arrayReplaceElement(accUserList, matchingUsers[j].user.setNewAttributes(updatedUser), matchingUsers[j].index))
            }
            accUserList = recUpdateMatchingUsers();
        }
        return UserList.newUserList({
            userArray: accUserList,
            paymentsWithoutAccount: accPaymentsWithoutWpAccount
        });
    }

    addBrightspaceData = brightspaceData => {

        const recAddBrightspaceData = (i = 0, accUserList = this.users,
            accBsUsersWithoutWpAccount = this.bsAccountsWithoutWpAccount) => {

            if (i === brightspaceData.length) return {
                userArray: accUserList,
                bsAccountsWithoutWpAccount: accBsUsersWithoutWpAccount
            }

            const matchingUser = this.#findUser(user => user.username.toLowerCase() === brightspaceData[i].UserName.toLowerCase(), false);

            if (matchingUser !== undefined) {
                const updatedUser = {
                    ...matchingUser[i],
                    bs_id: brightspaceData[i].UserId,
                    bs_last_accessed_date: brightspaceData[i].LastAccessedDate === '' ? '' :
                        new Date(brightspaceData[i].LastAccessedDate),
                    bs_enrolled_courses: brightspaceData[i].enrolledCourses
                }
                return recAddBrightspaceData(i + 1, arrayReplaceElement(accUserList,
                    matchingUser.user.setNewAttributes(updatedUser), matchingUser.index));
            }
            return recAddBrightspaceData(i + 1, accUserList, [...accBsUsersWithoutWpAccount, brightspaceData[i]]);
        }
        return UserList.newUserList(recAddBrightspaceData());
    }

    #findUser = (predicate, findMultiple = false) => {
        
        const matchingUsers = this.users.filter(predicate).map((user, i) => ({
            index: i, 
            user: user
        }));
       
        if (findMultiple) return matchingUsers;
        if (matchingUsers.length > 1) throw newErrMsg('Too many items found');
        return matchingUsers[0];
    }

    static newUserList = ({ userArray = [], paymentsWithoutAccount = [] }) => {
        const newUserList = new UserList({ userArray: userArray, paymentsWithoutAccount: paymentsWithoutAccount });
        Object.freeze(newUserList);
        return newUserList;
    }

    dataStoreFormat = () => this.users.map(user => user.saveFormat());




}


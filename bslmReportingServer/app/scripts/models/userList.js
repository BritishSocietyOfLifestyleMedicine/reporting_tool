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
        const recAddPayments = (accUserList = this.users, accPaymentsWithoutWpAccount = this.paymentsWithoutWpAccount, i = 0) => {
            if (i === paymentList.length) return {
                userArray: accUserList,
                paymentsWithoutAccount: accPaymentsWithoutWpAccount
            };

            const matchingUsers = this.#findUser(
                user => user.customer_id === paymentList[i].customer_id && paymentList[i].customer_id !== '' ||
                    paymentList[i].receipt_email === user.username || paymentList[i].receipt_email === user.email, true);

            if (matchingUsers === undefined || !matchingUsers.length)
                return recAddPayments(accUserList, [...accPaymentsWithoutWpAccount, paymentList[i]], i + 1);

            const recUpdateMatchingUsers = (j = 0, accMatchingUserList = accUserList) => {
                if (j === matchingUsers.length) return accMatchingUserList;
                const updatedUser = {
                    ...matchingUsers[j].user,
                    payments: [...matchingUsers[j].user.payments, paymentList[j]]
                }
                return recUpdateMatchingUsers(j + 1,
                    arrayReplaceElement(accUserList, matchingUsers[j].user.setNewAttributes(updatedUser), matchingUsers[j].index))
            }
            return recAddPayments(recUpdateMatchingUsers(), accPaymentsWithoutWpAccount, i + 1);
        }
        return UserList.newUserList(recAddPayments());
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
        const recfindUser = (i = 0, accMatchList = []) => {

            if (!this.users.length || i === this.users.length) {
                if (findMultiple) return accMatchList;
                if (accMatchList.length > 1) throw newErrMsg('Too many items found');
                return accMatchList[0];
            }
            if (predicate(this.users[i]))
                return recfindUser(i + 1, [...accMatchList, { index: i, user: this.users[i] }]);

            return recfindUser(i + 1, accMatchList);
        }
        return recfindUser();
    }

    static newUserList = ({ userArray = [], paymentsWithoutAccount = [] }) => {
        const newUserList = new UserList({ userArray: userArray, paymentsWithoutAccount: paymentsWithoutAccount });
        Object.freeze(newUserList);
        return newUserList;
    }

    dataStoreFormat = () => this.users.map(user => user.saveFormat());

}


"use strict";

// run function after data collection
const updateStoreFile = async (storeFileList, newUserList, paymentList) => {

    const lastStoredUserBuild = buildLatestStoredSnapshot(storeFileList);

    const saveSafeUserList = newUserList.dataStoreFormat();

    const newUserDiffs = generateDiffs(lastStoredUserBuild, saveSafeUserList);
    if (!newUserDiffs.additions.length && !newUserDiffs.deletions.length && !newUserDiffs.edits.length) {
        console.log('no changes made');
        return;
    }

    const newJsonStoreData = buildStoreJson(storeFileList.userDiffs, newUserDiffs, paymentList);

    console.log(newJsonStoreData);

    writeToStoreFile(newJsonStoreData);
    return newJsonStoreData;
}

const getStoreFileList = async () => {
    const response = await fetch(`reporting_data.store`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).catch(err => {
        console.log(appendErrMsg(err, 'failed getting data store fetch'));
        return false;
    })
    if (!response) return;
    const json = await response.json().catch(err => appendErrMsg(err, 'Could not read data store file'));
    const tidyJson = tidyStoreJson(json);
    Object.freeze(tidyJson);
    return tidyJson;
}

/**
 * Formats the store array.  In this case it takes all of the date strings and turns them into date objects, available for 
 * more functionality in the future
 * @param {Object} obj - Raw store file array with all of the snapshot changes
 * @returns formatted store array
 */
const tidyStoreJson = obj => {
    if (obj === null) return;
    const recConvertPropsToDate = (objEntries, accObj) => {
        if (!objEntries.length) return accObj;
        // Generic recursion for accessing all properites in an object containing objects and arrays
        if (typeof objEntries[0][1] === 'object') {
            // if entry value is an array, return the array with that element in the recursion
            if (Object.prototype.toString.call(accObj) === '[object Array]')
                return recConvertPropsToDate(objEntries.slice(1),
                    arrayReplaceElement(accObj, tidyStoreJson(objEntries[0][1]), objEntries[0][0]));
            // if entry value is an object, return the object with that property in the recursion
            else
                return recConvertPropsToDate(objEntries.slice(1),
                    { ...accObj, [objEntries[0][0]]: tidyStoreJson(objEntries[0][1]) });
        }

        // changes to the object/array made here
        if (objEntries[0][0].toLowerCase().includes('date')) {
            const newDate = objEntries[0][1] === '' ? '' : new Date(objEntries[0][1]);
            return recConvertPropsToDate(objEntries.slice(1), { ...accObj, [objEntries[0][0]]: newDate });
        }
        // catch case if nothing is changed
        return recConvertPropsToDate(objEntries.slice(1), accObj);
    }
    return recConvertPropsToDate(Object.entries(obj), obj);
}

/**
 * 
 * @param {Array} arr 
 * @param {Any} element 
 * @param {Int} i 
 * @returns {Array}
 * Replaces an element in an array immutably.  Can also be used to add an element to the array.  
 */
const arrayReplaceElement = (arr, element, i) => [...arr.slice(0, i), element, ...arr.slice(i + 1)];

/**
 * Finds the differences between the last stored build and the new user list
 * @param {Array} lastStoredUserBuild - Array of users build from the changes in the datastore which 
 *                                  represents the most recent saved snapshot
 * @param {Array} userList - Array of users downloaded from the internet
 * @returns {Array} - Array of Additions (array of new users), Deletions (array of deleted users) and 
 *                      Edits (list of users which have been edited and the properties which were changed)
 */
const generateDiffs = (lastStoredUserBuild, userList) => {
    //for each user, check if the array of matching users (in the last build) with the same id is empty
    const additions = userList.filter(user => !lastStoredUserBuild.some(storedUser => storedUser.id === user.id));
    // the reverse of the additions 
    const deletions = lastStoredUserBuild.filter(storedUser => !userList.some(user => user.id === storedUser.id));

    // find users which exist in the last stored build and create an object storing the user's id and 
    // the user object properties which were changed from the last build.  If nothing has changed discard the edit.
    const edits = userList.filter(user => lastStoredUserBuild.some(storedUser => storedUser.id === user.id))
        .map(user => {
            const matchingStoredUser = lastStoredUserBuild.find(storedUser => storedUser.id == user.id);
            return {
                id: user.id,
                userEditList: objDiffs(matchingStoredUser, user)
            }
        }).filter(edit => edit.userEditList.length);

    return {
        date: new Date(),
        additions: additions,
        deletions: deletions,
        edits: edits
    }
}

/**
 * Applies the incrementUserSnapshot() function until the most recent snapshot has been aquired.
 * @param {Object} storeFileList - The object from the store file
 * @returns {Array} - The most up to date user snap shot built from all of the stored edits 
 */
const buildLatestStoredSnapshot = storeFileList => {
    const buildSnapShotRec = (storeFileIndex = 0, accSnapShot = []) => {
        if (storeFileIndex === storeFileList.userDiffs.length) return accSnapShot;
        return buildSnapShotRec(storeFileIndex + 1, incrementUserSnapshot(storeFileList.userDiffs[storeFileIndex], accSnapShot));
    }
    return buildSnapShotRec();
}

/**
 * Takes a list of users and a single entry in the store file and applies all of the edits to that list
 * This function is seperate from buildLatestStoredSnapshot() so that it can be called individually for making
 * graphs
 * @param {Object} storeFileListEntry - Object containing the additions, deletions and edits for that date
 * @param {Array} currentSnapShot - Array of users before the edits have been applied
 * @returns {Array} - Array of users after the edits have been applied
 */
const incrementUserSnapshot = (storeFileListEntry, currentSnapShot) => {
    // combine the array from the removed users and the new users to be added
    const additionsAndDeletions = [
        ...removeUsers([...storeFileListEntry.deletions], currentSnapShot),
        ...storeFileListEntry.additions
    ];
    const recApplyEdits = (edits, accEntry) => {
        if (!edits.length) return accEntry;

        //find the user object to apply the edits to
        const user = accEntry.find(user => user.id === edits[0].id);
        const editedUser = editObj(user, edits[0].userEditList);
        // remove the old object from the array and insert the edited object
        const newAccEntry = [...removeUser(user, accEntry), editedUser]
        return recApplyEdits(edits.slice(1), newAccEntry)
    }
    return recApplyEdits(storeFileListEntry.edits, additionsAndDeletions)
}

/**
 * Removes any overlap between new and old payments and combines into one list
 * @param {Array} storeFileListPayments - List of payments already stored
 * @param {Array} downloadedPaymentList - List of new payments
 * @returns {Array} - Complete payment list
 */
const buildPaymentsList = (storeFileListPayments, downloadedPaymentList) => {
    if (!storeFileListPayments.length) return downloadedPaymentList;
    const newPaymentList = downloadedPaymentList.filter(payment => payment.date_created > storeFileListPayments[0].date_created)
    return [...newPaymentList, ...storeFileListPayments];
}

/**
 * Applies a list of edits (additions, deletions and edits to object props) to the provided object
 * @param {Object} obj - Object which is going to be edited
 * @param {Array} edits - List of edits to be made to the object
 * @returns {Object} - The edited object
 */
const editObj = (obj, edits) => {

    // magical helper function which immuntably removes a prop from an object
    // ngl I have no idea how this works - something to do with dynamic destructuring 
    const removePropery = (prop, { [prop]: exclProp, ...rest }) => rest;

    // Recursive function to apply each edit
    const recEditObj = (edits, accObj) => {
        if (!edits.length)
            return accObj;

        // If the prop is being deleted it doesn't matter what the prop value is so can return here with prop removed
        if (edits[0].type == et.DELETION) return recEditObj(edits.slice(1), removePropery(edits[0].key, accObj));

        // If the new value (edits[0].value) is itself an object, run the recursion on it before moving on with the function
        const insertValue = typeof edits[0].value === 'object' && edits[0].editType === et.EDIT ?
            editObj(accObj[edits[0].key], edits[0].value) : edits[0].value;

        // editing and adding are the same thing so no need to check
        // [edits[0].key] is dynamically passing in the key of the value object when creating the new object
        // if the object being editted is an array, it still needs to be an array after it has been editted
        if (Array.isArray(accObj))
            return recEditObj(edits.slice(1), arrayReplaceElement(accObj, insertValue, parseInt(edits[0].key)));
        else
            return recEditObj(edits.slice(1), { ...accObj, [edits[0].key]: insertValue });

    }
    return recEditObj(edits, obj);
}

/**
 * 
 * @param {Array} storeUserList - current user diff list in store file
 * @param {Object} newUserDiffs - new user diffs to add to store file
 * @param {Array} paymentList - updated payment list
 * @returns {Object} - JSON to be stored in store file
 */
const buildStoreJson = (storeUserList, newUserDiffs, paymentList) => ({
    payments: paymentList,
    userDiffs: [...storeUserList, newUserDiffs]
})

/**
 * Initialises store file with empty JSON field
 * This will delete any data stored
 */
// const deleteStoreFileJson = () => writeToStoreFile({
//     payments: [],
//     userDiffs: []
// });


/**
 * Writes a js object to the datastore - This will overwrite the datastore completely so use with caution
 * @param {Object} json - Javascript object to write to the data store 
 */
const writeToStoreFile = async json => {
    const url = 'http://localhost:8000/storedata';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json)
    }).catch(err => console.log(err));
    console.log(response);
}

/**
 * @param {Object} user - User object to be removed
 * @param {Array} userList - Array of users
 * @returns {Array} - Array of users with the removed user missing
 */
const removeUser = (user, userList) => {
    const userIndex = userList.findIndex(listUser => listUser.id === user.id);
    return [...userList.slice(0, userIndex), ...userList.slice(userIndex + 1)];
}

// Function to apply the removeUser() function to an array of users
const removeUsers = (users, userList) => {
    const recRemoveUsers = (recUsers, userAcc) => {
        if (!recUsers.length) return userAcc;
        return recRemoveUsers(recUsers.slice(1), removeUser(recUsers[0], userAcc));
    }
    return recRemoveUsers(users, userList);
}

/**
 * Takes two objects and determines whether they are equal.  Equality here is based on the objects having
 * the same keys and those keys having the same values.  The function will recursivly check nested objects.  
 * This is a quicker way to measure equality than the objDiffs function.  
 * @param {Object} obj1 - An object to compare
 * @param {Object} obj2 - Another object to compare
 * @returns {Boolean} - True = objects being equal - False = objects not being equal
 */
const objEquals = (obj1, obj2) => {
    if (obj1 === null || obj2 === null) return false;

    // if the objects have different numbers of keys the cannot be equal
    if (Object.keys(obj1).length != Object.keys(obj2).length) return false;

    // Recursive function which takes lists of keys and vals from each object and compares them.
    // Object.entries() might have been cleaner but this way the keys and vals are labeled.
    // function iterates through one object comparing each key & val to the other object.
    const recObjEquals = (keys1, vals1, keys2, vals2) => {
        if (!keys1.length) return true;
        // check if key exists in other object
        if (!keys2.includes(keys1[0])) return false;
        // if val matching the key is an object recursively check that object
        if (typeof vals1[0] === 'object') {
            const matchingVal2 = vals2[keys2.findIndex(key => key === keys1[0])];
            // if matching val is not an object they must be different
            if (typeof matchingVal2 != 'object') return false;
            if (!objEquals(vals1[0], matchingVal2)) return false;
        }
        // if val is not an object check if that val exists in the other object
        else if (!vals2.includes(vals1[0])) return false;
        // no inequalities found, check the next key, val pair
        return recObjEquals(keys1.slice(1), vals1.slice(1), keys2, vals2);
    }
    return recObjEquals(Object.keys(obj1), Object.values(obj1), Object.keys(obj2), Object.values(obj2));
};


/**
 * Compilies a list of all the differences between two objects.  
 * @param {Object} oldObj - Object to compare from
 * @param {Object} newObj - Object to compare to
 * @returns {Array} - Array of differences 
 */
const objDiffs = (oldObj, newObj) => {

    // object to save details of edits found
    const diffInfo = (editType, key, val) => {
        const nullSafeVal = val === null || val === undefined ? '' : val;
        return {
            key: key,
            value: nullSafeVal,
            editType: editType
        }
    }

    // Recursive function (similar to objEquals() which takes a list of keys and vals for each object and compares them.
    // When iterating through an object's keys and vals you won't find any keys which only exist in the other object - this 
    // would demonstrate a deletion in the data.  To catch this the function, the is run twice with each object having each 
    // object's keys & vals iterated and compared to the other.  On the second run we are only looking for deletions though 
    // so the editType param will block the function from saving additions or edits on the second run.    
    const recObjDiffs = (oldKeys, oldVals, newKeys, newVals, editType, accDiffs = []) => {
        // recur exit case
        if (!newKeys.length) return accDiffs;

        // check if current key matches old object keys - if the key doesn't exist then it has been added or deleted 
        // and no further checks are needed
        if (!oldKeys.includes(newKeys[0]))
            return recObjDiffs(oldKeys, oldVals, newKeys.slice(1), newVals.slice(1), editType,
                [...accDiffs, diffInfo(editType, newKeys[0], newVals[0])]);

        // addition and deletion have been ruled out so if the values don't match it must be an edit

        // if value is an object
        if (typeof newVals[0] === 'object') {
            const matchingOldVal = oldVals[oldKeys.findIndex(key => key === newKeys[0])];
            const subDiffs = objDiffs(matchingOldVal, newVals[0]);
            // if sub object matches return and check next key, val
            if (!subDiffs.length)
                return recObjDiffs(oldKeys, oldVals, newKeys.slice(1), newVals.slice(1), editType, accDiffs);

            else if (editType === et.ADDITION)
                return recObjDiffs(oldKeys, oldVals, newKeys.slice(1), newVals.slice(1), editType,
                    [...accDiffs, diffInfo(et.EDIT, newKeys[0], subDiffs)]);


        }
        // if value is not an object
        else if (!oldVals.includes(newVals[0]) && editType === et.ADDITION)
            return recObjDiffs(oldKeys, oldVals, newKeys.slice(1), newVals.slice(1), editType,
                [...accDiffs, diffInfo(et.EDIT, newKeys[0], newVals[0])]);

        // base return if no changes are found
        return recObjDiffs(oldKeys, oldVals, newKeys.slice(1), newVals.slice(1), editType, accDiffs);

    }

    const additions =
        recObjDiffs(Object.keys(oldObj), Object.values(oldObj), Object.keys(newObj), Object.values(newObj), et.ADDITION);

    const deletions =
        recObjDiffs(Object.keys(newObj), Object.values(newObj), Object.keys(oldObj), Object.values(oldObj), et.DELETION);

    return [...additions, ...deletions];


};

/**
 * edit type enum
 */
const et = {
    ADDITION: 'ADDITION',
    DELETION: 'DELETION',
    EDIT: 'EDIT'
}
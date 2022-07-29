"use strict";


const downloadInfoCsv = (objList, fileName) => {
    const formattedObjs = formatSubObjects(objList);
    const csvString = buildInfoCsv(formattedObjs);
    download(csvString, fileName);
}

/**
 * Formats objects to remove any sub objects or anything else that wouldn't work when converting to CSV
 * Add more ifs in future for more formatting options
 * @param {Array[Object]} objList - list of objects being formatted 
 * @returns {Array} - list of objects after being formatted
 */
const formatSubObjects = objList => objList.map(obj => {
    // if object is a user object, format accordingly
    if (obj.hasOwnProperty('payments') || obj.hasOwnProperty('bs_enrolled_classes'))
        return formatUserForCsv(obj);
    return obj;
})

const downloadBsBumCsv = (userList, fileName, type, courseCode) => {
    const csvString = buildBsBumCsv(userList, type, courseCode);
    download(csvString, fileName);
}


/**
 * Takes a CSV string and inserts it into a file download.   
 * @param {String} csvString - A premade CSV string to be inserted into the file download
 * @param {String} fileName - The name of the CSV file, the date will be appended to the title so the download 
 *    doesn't overwrite the last download 
 */
const download = (csvString, fileName) => {
    const dateObj = new Date();
    const date = `${dateObj.getDate()}-${dateObj.getMonth() + 1}-${dateObj.getFullYear()}`;
    const fileNameWithDate = `${fileName}_${date}.csv`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvString));
    element.setAttribute('download', fileNameWithDate);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * The logic for how a list of objects is converted into a CSV.  The first line is created by join()ing the keys from the 
 * first object with commas to create the CSV column titles.  Then each object in the list is mapped to an array of it's
 * values, each of which are escaped and join()ed with commas.  After each object value array a newline char is inserted 
 * to create a new row in the CSV.    
 * @param {Array[Object]} objList - A list of objects to be converted into a CSV 
 * @returns {String} - A CSV string to pass to the file download element.  
 */
const buildInfoCsv = objList => Object.keys(objList[0]).join(',') + '\n' + objList.map(obj => Object.values(obj)
    .map(objProp => escapeProp(objProp)).join(',')).join('\n');

// If the string includes commas, wrap it in double quotes so it is treated as a single cell in excel 
const escapeComma = str => typeof str === 'string' && str.includes(',') ? `"${str.replace(/,+$/, '')}"` : str;

// Remove any new line chars in the string to not confuse excel
const escapeNewLine = str => typeof str === 'string' ? str.replace(/\r/g, '').replace(/\n/g, '') : str;

// Exclude any strings over 1000 chars in length - This is mainly to stop the stringified version of the entire object
// making it into the csv
const excludeLongString = str => typeof str === 'string' && str.length > 1000 ? '' : str;

const escapeProp = prop => escapeComma(escapeNewLine(excludeLongString(prop)));

const buildBsBumCsv = (userList, type, courseCode = '') => {
    if (type === 'CREATE') return userList.map(user => userCreateStr(user)).join('\n');
    if (type === 'ENROLL') return userList.map(user => userEnrollStr(user, courseCode)).join('\n');
}

// CREATE, Username, Org Defined ID, *First Name, *Last Name, Password, *Role Name, Is Active, *Email
const userCreateStr = user => `CREATE,${user.username.toLowerCase()},${user.username.toLowerCase()},${title(user.first_name)},${title(user.last_name)},BSLM1234,LEARNER,1,${user.email.toLowerCase()}`;

// ENROLL, *Username, Org Defined ID, *Role Name, *Org Unit Code
const userEnrollStr = (user, courseCode) => `ENROLL,${user.username.toLowerCase()},,LEARNER,${courseCode}`;

const formatUserForCsv = user => ({
    ...user,
    payments: user.payments.map(payment => payment.amount).join(', '),
    bs_enrolled_courses: user.bs_enrolled_courses.map(course => course.name).join(', ')
});

const title = str => str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();




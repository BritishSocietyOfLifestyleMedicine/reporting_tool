"use strict";

const BsAuthUrl = 'https://auth.brightspace.com/oauth2/auth?';
const BsTokenUrl = 'https://auth.brightspace.com/core/connect/token';

const getCourse = orgUnitId => coursesToGet.find(course => course.orgUnitId == orgUnitId);

const getBrightspaceUsers = async (bsToken) => {
    console.log(bsToken);

    const bsResponseLists = await getBrightspaceData(bsToken.access_token);
    const bsUserList = combineBsLists(bsResponseLists);
    return bsUserList;
}

const getBrightspaceToken = async storedBsCreds => {
    const brightSpaceScopeHeader = [['scope', 'core:*:* users:userdata:read enrollment:*:read grades:gradevalues:read']];
    showGettingBsToken();
    try {
        const tokenObj = await getOAuthAccessToken(BsAuthUrl, BsTokenUrl, storedBsCreds.oauthClientId,
            storedBsCreds.oauthClientSecret, storedBsCreds.oauthRedirectUri, brightSpaceScopeHeader);

        showAcquiredBsToken();
        // localDataStore.setData({brightspaceToken: tokenObj});
        // resolve(tokenObj);
        return tokenObj;
    } catch (err) {
        showBsLoginButton();
        console.log(err);
        throw err;
    }
}


const getBrightspaceData = async token => {
    const usersUrl = 'https://learningacademy.bslm.org.uk/d2l/api/lp/1.31/users/?bookmark=';
    const coursesUrl = orgUnitId => `https://learningacademy.bslm.org.uk/d2l/api/lp/1.31/enrollments/orgUnits/${orgUnitId}/users/?bookmark=`;

    // leave this as a double array!
    const authHeader = new Headers([['Authorization', 'Bearer ' + token]]);

    const promises = [brightspaceFetch(authHeader, usersUrl, 'brightspaceusers')];

    coursesToGet.forEach(course =>
        promises.push(brightspaceFetch(authHeader, coursesUrl(course.orgUnitId), `course ${course.orgUnitId}`)));

    const finishedPromiseList = await Promise.all(promises);


    return finishedPromiseList;
}

const brightspaceFetch = async (authHeader, url, promiseLabel) => {

    const recFetch = async (acc, bookmark = 0) => {

        const response = await fetch(url + bookmark, {
            method: 'GET',
            headers: authHeader
        }).catch(err => { throw appendErrMsg(err, `Bad fetch on ${promiseLabel}`) });

        if (!response) throw newErrMsg(`Bad Brightspace response - ${promiseLabel}`);
        const json = await response.json();
        if (json.hasOwnProperty('status') && json.status !== 200) throw newErrMsg(`Bad Brightspace token - ${promiseLabel}`);
        else if (!json.PagingInfo.HasMoreItems) return acc.concat(json.Items);
        else return recFetch(acc.concat(json.Items), json.PagingInfo.Bookmark);
    }
    return await recFetch([promiseLabel]);
}


const combineBsLists = bsResponseLists => {

    const userList = bsResponseLists.filter(prom => prom[0] == 'brightspaceusers')
        .flatMap(users => users.slice(1).map(user => ({ ...user, enrolledCourses: [] })));

    Object.freeze(userList);

    const courses = bsResponseLists.filter(prom => prom[0].includes('course')).map(course => ({
        orgUnitId: course[0].split('course ')[1],
        courseUsers: course.slice(1)
    }));
    Object.freeze(courses);

    const combinedBsList = userList.map(user => {
        // find enrolled courses by filtering courses which have a user with the right id and then return the course info
        // from "getCourse()"
        const enrolledCourses = courses.filter(course =>
            course.courseUsers.some(cs => cs.User.Identifier === user.UserId.toString()))
            .map(course => getCourse(course.orgUnitId));
        return {
            ...user,
            enrolledCourses: enrolledCourses
        }
    })
    console.log(combinedBsList);

    return combinedBsList;
}

const coursesToGet = [{
    orgUnitId: '6678',
    name: 'Introduction to the Microbiome',
    courseCode: 'CO_MB1'
}, {
    orgUnitId: '6687',
    name: 'BSLM Maintenance of Certificate 2022',
    courseCode: 'MOC2022'
}, {
    orgUnitId: '6686',
    name: 'BSLM Maintenance of Certificate 2021',
    courseCode: 'MOC2021'
}, {
    orgUnitId: '6685',
    name: 'Brain Health and Lifestyle Medicine',
    courseCode: 'BHLM01'
}, {
    orgUnitId: '6683',
    name: 'Lifestyle Medicine: An Overview',
    courseCode: 'LM03'
}, {
    orgUnitId: '6682',
    name: 'BSLM Project Info Course 2021',
    courseCode: 'LCS-Project_Info_Course'
}, {
    orgUnitId: '6681',
    name: 'Lifestyle Medicine: A Foundation Course',
    courseCode: 'LM02'
}, {
    orgUnitId: '6693',
    name: '	Microbiome Modules',
    courseCode: 'CO_IGM02'
}]



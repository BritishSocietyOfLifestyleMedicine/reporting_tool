'use strict';

const bsOAuthRedirectUrl = 'https://britishsocietyoflifestyemedicine.s3.eu-west-2.amazonaws.com/Misc/amazon_oauth_redirct/redirect.html';
const bsOAuthclientId = '69e542cf-8e27-46dd-8f90-8dd5ba4dc673';
const bsOAuthClientSecret = '5hHZF8tt5zRr35BJoJKrUrfQBeLB0gyHA0KyE16-zdA';
const BsAuthUrl = 'https://auth.brightspace.com/oauth2/auth?';
const BsTokenUrl = 'https://auth.brightspace.com/core/connect/token';

const course = {
    orgUnitId: '6683',
    name: 'Lifestyle Medicine: An Overview',
    courseCode: 'LM03'
}

const getBrightspaceToken = async () => {
    const brightSpaceScopeHeader = [['scope', 'core:*:* users:userdata:read enrollment:*:read grades:gradevalues:read']];
    try {
        const tokenObj = await getOAuthAccessToken(BsAuthUrl, BsTokenUrl, bsOAuthclientId, bsOAuthClientSecret,
            bsOAuthRedirectUrl, brightSpaceScopeHeader);

        // const users = await getBrightspaceUsers(tokenObj.access_token);
        // console.log(users);

        const course = await getBrightspaceCourse(tokenObj.access_token);
        console.log(course);

        const grades = await getBrightspaceCourseGrades(tokenObj.access_token);
        console.log(grades);

        const missingUsers = course.filter(c => !grades.some(g => g.bsId === c.User.Identifier));
        console.log(missingUsers);

        // const courseCompletions = await getBrightspaceCourseCompletions(tokenObj.access_token);
        // console.log(courseCompletions);

    } catch (err) {
        console.log(err);
    }
}

const getBrightspaceUsers = token => {
    const usersUrl = 'https://learningacademy.bslm.org.uk/d2l/api/lp/1.31/users/?bookmark=';
    const authHeader = new Headers([['Authorization', 'Bearer ' + token]]);
    return brightspaceFetch(authHeader, usersUrl);
}

const getBrightspaceCourse = token => {
    const coursesUrl = `https://learningacademy.bslm.org.uk/d2l/api/lp/1.31/enrollments/orgUnits/6683/users/?bookmark=`;
    const authHeader = new Headers([['Authorization', 'Bearer ' + token]]);
    return brightspaceFetch(authHeader, coursesUrl);
}

const getBrightspaceCourseGrades = token => {
    const authHeader = new Headers([['Authorization', 'Bearer ' + token]]);
    const gradesUrl = `https://learningacademy.bslm.org.uk/d2l/api/le/1.51/6683/grades/final/values/`;
    return testFetch(authHeader, gradesUrl);
}

const getBrightspaceCourseCompletions = token => {
    const authHeader = new Headers([['Authorization', 'Bearer ' + token]]);
    const courseCompletionUrl = `https://learningacademy.bslm.org.uk/d2l/api/le/1.51/6683/grades/courseCompletion/?bookmark=`;
    return brightspaceFetch(authHeader, courseCompletionUrl)
}

const brightspaceFetch = async (authHeader, url) => {
    const recFetch = async (acc, bookmark = 0) => {

        const response = await fetch(url + bookmark, {
            method: 'GET',
            headers: authHeader
        }).catch(err => {
            reject(appendErrMsg(err, `Bad fetch`))
            return false;
        });

        if (!response) throw newErrMsg(`Bad Brightspace response`);
        const json = await response.json();
        if (json.hasOwnProperty('status') && json.status == 500) throw newErrMsg(`Bad Brightspace token}`);
        else if (!json.PagingInfo.HasMoreItems) return acc.concat(json.Items);
        else return recFetch(acc.concat(json.Items), json.PagingInfo.Bookmark);
    }
    return await recFetch([]);
}

const testFetch = async (authHeader, url) => {

    const recFetch = async (nextUrl, acc) => {

        const response = await fetch(nextUrl, {
            method: 'GET',
            headers: authHeader
        }).catch(err => {
            throw appendErrMsg(err, 'bad new fetch (grades)');
        });
        const json = await response.json();
        // console.log(json);
        if (json.Next === null) return acc;
        const userGrades = json.Objects.map(obj => mapGradeObj(obj))
        return recFetch('https://learningacademy.bslm.org.uk/' + json.Next, [...acc, ...userGrades])
    }
    const grades = await recFetch(url, []);
    return grades;
}

const mapGradeObj = object => ({
    name: object.User.DisplayName,
    email: object.User.EmailAddress,
    bsId: object.User.Identifier,
    grade: object.GradeValue
})

setTimeout(() => getBrightspaceToken(), 500);

//https://testbslm.bslm.org.uk/d2l/api/le/1.51/6683/grades/final/values/
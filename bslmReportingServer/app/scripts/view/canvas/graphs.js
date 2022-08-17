'use strict';

const drawGraphs = storeFileList => {
    const getDataPoints = predicate => graphDataPointOverTime(predicate, storeFileList).map(dataPoint => ({
        x: dataPoint.date,
        y: dataPoint.amount
    }))

    addFullMemberGraph(getDataPoints);
    addLegacyMemberGraph(getDataPoints);
    addStudentMemberGraph(getDataPoints);
    addWpCertMemberGraph(getDataPoints);
    addGraphNotLoggedInMembers(getDataPoints);
    addGraphWeeklyActiveUsers(getDataPoints);
}

const addFullMemberGraph = (getDataPoints) => {
    const title = 'Number of Paid Members Over Time';
    const width = 600;
    const height = 300;
    const limits = {
        max: 1480,
        min: 1320
    }
    const predicate = user => isPaidMember(user);
    const dataPoints = getDataPoints(predicate);
    addGraph(dataPoints, title, width, height, limits)
}

const addStudentMemberGraph = (getDataPoints) => {
    const title = 'Number of Student Members Over Time';
    const width = 600;
    const height = 300;
    const limits = {
        max: 200,
        min: 50
    }
    const predicate = user => user.membership_type === 'Student Member';
    const dataPoints = getDataPoints(predicate);
    addGraph(dataPoints, title, width, height, limits);
}

const addWpCertMemberGraph = (getDataPoints) => {
    const title = 'Number of Certificates Over Time';
    const width = 600;
    const height = 300;
    const limits = {
        max: 480,
        min: 370
    }
    const predicate = user => user.certificate_type !== '';
    const dataPoints = getDataPoints(predicate);
    addGraph(dataPoints, title, width, height, limits);
}

const addLegacyMemberGraph = (getDataPoints) => {
    const title = 'Number of Legacy Members Over Time';
    const width = 600;
    const height = 300;
    const limits = {
        max: 1500,
        min: 500
    }
    const predicate = user => user.membership_type === 'Full Member';
    const dataPoints = getDataPoints(predicate);
    addGraph(dataPoints, title, width, height, limits);
}

const addGraphNotLoggedInMembers = (getDataPoints) => {
    const title = `Number of paid users who haven't logged in within 6 months`;
    const width = 600;
    const height = 300;
    const limits = {
        max: 500,
        min: 300
    }
    const date6MonthsAgo = new Date().setMonth(new Date().getMonth() - 6);
    const predicate = user => user.date_last_logged_in < date6MonthsAgo && user.membership_type === 'Full Member';
    const dataPoints = getDataPoints(predicate);
    addGraph(dataPoints, title, width, height, limits);
}

const addGraphWeeklyActiveUsers = (getDataPoints) => {
    const title = `Number of active weekly users`;
    const width = 600;
    const height = 300;
    const limits = {
        max: 500,
        min: 300
    }
    const date2WeeksAgo = new Date(new Date().setDate(new Date().getDate() - 100));
    console.log(date2WeeksAgo);
    const predicate = user => user.date_last_logged_in > date2WeeksAgo;
    const dataPoints = getDataPoints(predicate);
    addGraph(dataPoints, title, width, height);
}


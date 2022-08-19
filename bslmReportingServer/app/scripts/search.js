"use strict";

const paidMembershipTypes = [
    'Full Member',
    'Student Member',
    'Associate Member',
    'Applicant Member',
    'Honorary Member',
    'Subscriber'
]

const findListsOfInterest = userList => {
    const dodgyUsers = userList.filter(user => isSusUser(user) && user.membership_type != 'Administrator');
    const unpaidFullMembers = userList.filter(user => isUnpaidAndFullMember(user));
    const paidLegacyMembers = userList.filter(user => isPaidLegacyMember(user));
    const usersToEnrollInBs = userList.filter(user => isPaidMember(user) && !isBsUser(user));
    const usersToEnrollInOverviewCourse =
        userList.filter(user => isPaidMember(user) && isBsUser(user) && !isEnrolledInBsCourse(user, '6683'));
    const usersToUnenrollFromOverviewCourse = userList.filter(user => !isPaidMember(user) && isEnrolledInBsCourse(user, '6683'));
    const findUsersSharingPhoneNumber = userList.filter(user => user.share_phone_number == "1");
    const usersNotLoggedInSince = numMonthsOld => userList.filter(user => isUserPaidAndNotLoggedIn(user, numMonthsOld));
    const usersEnrolledInOverviewCourse = userList.filter(user => isEnrolledInBsCourse(user, '6683'));
    const usersEnrolledInMocCourse = userList.filter(user => isEnrolledInBsCourse(user, '6687'));

    console.log(usersEnrolledInOverviewCourse);

    return [
        {
            name: 'Dodgy Users',
            description: 'Users with names and/or usernames which look like they have been created illegally',
            users: dodgyUsers,
            downloadFunc: () => downloadInfoCsv(dodgyUsers, 'dodgy_wordpress_users')
        }, {
            name: 'Unpaid Full Members',
            description: 'Users who\'s paid-to date has passed but are still a member',
            users: unpaidFullMembers,
            downloadFunc: () => downloadInfoCsv(unpaidFullMembers, 'unpaid_full_member_wordpress_users')
        }, {
            name: 'Paid Legacy Members',
            description: 'Users who have their paid-to date in the future but have not been upgraded',
            users: paidLegacyMembers,
            downloadFunc: () => downloadInfoCsv(paidLegacyMembers, 'paid_legacy_wordpress_users')
        }, {
            name: 'Users to enroll in Brightspace',
            description: 'Users who are paid members but not enrolled in Brightspace',
            users: usersToEnrollInBs,
            downloadFunc: () => {
                downloadBsBumCsv(usersToEnrollInBs, 'users_to_add_to_brightspace', 'CREATE');
                downloadBsBumCsv(usersToEnrollInBs, 'new_bs_users_to_enroll_in_overview_course', 'ENROLL', 'LM03');
            }
        }, {
            name: 'Users to enroll in the Brightspace overview course',
            description: 'Users who are in Brightspace but not enrolled in the overview course',
            users: usersToEnrollInOverviewCourse,
            downloadFunc: () => 
                downloadBsBumCsv(usersToEnrollInOverviewCourse, 
                'existing_bs_users_to_enroll_in_overview_course', 'ENROLL', 'LM03')
        }, {
            name: 'Users to unenroll from the overview course',
            description: 'Users who are not paid members but are still enrolled in the overview course',
            users: usersToUnenrollFromOverviewCourse,
            downloadFunc: () =>
                downloadInfoCsv(usersToUnenrollFromOverviewCourse, 'users_to_unenroll_from_overview_course')
        }, {
            name: 'Share phone number',
            description: 'Users with "Share Phone Number" enabled',
            users: findUsersSharingPhoneNumber,
            downloadFunc: () =>
                downloadInfoCsv(findUsersSharingPhoneNumber, 'users_with_share_phone_number_enabled')
        }, {
            name: 'Paid users who haven\'t logged in',
            description: 'Paid users who\'s last logged in date is 6 months in the past',
            users: usersNotLoggedInSince(6),
            downloadFunc: () =>
                downloadInfoCsv(usersNotLoggedInSince(6), 'users_not_logged_in_for_6_months')
        }, {
            name: 'Overview Users',
            description: 'Users who are enrolled in the overview course',
            users: usersEnrolledInOverviewCourse,
            downloadFunc: () =>
                downloadInfoCsv(usersEnrolledInOverviewCourse, 'users_enrolled_in_overview_course')
        }, {
            name: 'MOC Users',
            description: 'Users who are enrolled in the MOC course',
            users: usersEnrolledInMocCourse,
            downloadFunc: () =>
                downloadInfoCsv(usersEnrolledInMocCourse, 'users_enrolled_in_moc_course')
        }
    ].filter(list => list.users.length > 0);

};


const isPaidMember = user => paidMembershipTypes.includes(user.membership_type);

const isBsUser = user => user.bs_id !== '';

const isEnrolledInBsCourse = (user, orgUnitId) => user.bs_enrolled_courses.some(course => course.orgUnitId === orgUnitId);

const isSusUser = user => !user.username.includes('@') || user.first_name == '' || user.last_name == ''
    || user.membership_type == 'None';

const isPaidToDatePast = user => user.paid_to_date == '' || user.paid_to_date <= new Date();

const isUnpaidAndFullMember = user => isPaidMember(user) && isPaidToDatePast(user) && user.membership_type != 'Honorary Member';

const isPaidLegacyMember = user => !isPaidMember(user) && !isPaidToDatePast(user);

// const findMembersToCreateInBs = userList => userList.filter(user => isPaidMember(user) && isBsUser(user));

const findMemberstoEnroll = (userList, orgUnitId) =>
    userList.filter(user => isPaidMember(user) && isBsUser(user) && !isEnrolledInBsCourse(user, orgUnitId));

const isUserPaidAndNotLoggedIn = (user, monthsNotLoggedInSince) => {
    if (!isPaidMember(user)) return false;
    const currentDate = new Date();
    const notLoggedInSinceDate = currentDate.setMonth(currentDate.getMonth() - monthsNotLoggedInSince);
    return user.date_last_logged_in < notLoggedInSinceDate;
}


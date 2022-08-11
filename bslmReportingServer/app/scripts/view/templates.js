'use strict';

const addElement = (parent, template) => {
    const element = document.createElement('div');
    element.innerHTML = template.html;
    template.eventListeners.forEach(el => {

        if (typeof el.function == 'object') {
            const elElementArgs = el.function.classNameArgs.flatMap(arg => [...element.getElementsByClassName(arg)]);
            el.function = el.function.innerLogic(...el.function.args, ...elElementArgs);
        }
        [...element.getElementsByClassName(el.className)].forEach(eventElement =>
            eventElement.addEventListener(el.type, el.function));
    });
    parent.appendChild(element);
    const nodeReturn = template.nodeReturn == '' ? null : element.getElementsByClassName(template.nodeReturn)[0];
    element.replaceWith(element.firstChild);
    return nodeReturn
}

const userTemplate = (user, i) => {
    const greyRow = i % 2 === 0 ? `greyRow` : '';
    return {
        html: `<div class='tableRow ${greyRow}'>
    <div class='userTdIndex'>${i}</div>
    <div class='userTdId'>${user.id}</div>
    <div class='userTdEmail'>${user.email} </div>
    <div class='userTdTitle'>${user.title}</div>
    <div class='userTdFirstName'>${user.first_name}</div>
    <div class='userTdLastName'>${user.last_name}</div>
    <div class='userTdProfession'>${user.profession}</div>
    <div class='userTdMembershipType'>${user.membership_type}</div>
    <div class='userTdDateRegistered'>${dateToString(user.date_registered)}</div>
    <div class='userTdPaidToDate'>${dateToString(user.paid_to_date)}</div>
    <div class='userTdDateLastLoggedIn'>${dateToString(user.date_last_logged_in)}</div>
    <div class='userTdUsername'>${user.username}</div>
    <div class='userTdCustomerId'>${user.customer_id}</div>
    <div class='userTdCertType'>${user.certificate_type}</div>
    <div class='userTdCertDate'>${dateToString(user.certificate_date)}</div>
    </div>`,
        eventListeners: [{
            type: 'click',
            function: () => openModal(user),
            className: 'tableRow'
        }],
        nodeReturn: ''
    };
}

const userTitlesTemplate = () => ({
    html: `<div class="tableRow tableHeader">
    <div class='userTdIndex'>Index</div>
    <div class='userTdId'>ID</div>
    <div class='userTdEmail'>Email</div>
    <div class='userTdTitle'>Title</div>
    <div class='userTdFirstName'>First Name</div>
    <div class='userTdLastName'>Last Name</div>
    <div class='userTdProfession'>Profession</div>
    <div class='userTdMembershipType'>Membership Type</div>
    <div class='userTdDateRegistered'>Date Registered</div>
    <div class='userTdPaidToDate'>Paid-to Date</div>
    <div class='userTdDateLastLoggedIn'>Date Last Logged In</div>
    <div class='userTdUsername'>Username</div>
    <div class='userTdCustomerId'>Customer ID</div>
    <div class='userTdCertType'>Certificate Type</div>
    <div class='userTdCertDate'>Certificate Date</div>
    </div>`,
    eventListeners: [],
    nodeReturn: ''
})

const susUserListTitleTemplate = susUserList => ({
    html: `<div class="susUserWrapper">
    <div class="susUserText">
    <p class="susUserTitle">${susUserList.name}</p>
    <p class="susUserDescription">${susUserList.description}</p>
    <button class="downloadAsCsvBtn">Download List As CSV</button>
    <button class="hideSusListBtn">Toggle List</button>
    </div>
    <div class="${susUserList.name} wrapper" style="display:none"></div>
    </div>`,
    eventListeners: [{
        type: 'click',
        function: susUserList.downloadFunc,
        className: 'downloadAsCsvBtn'
    }, {
        type: 'click',
        function: {
            classNameArgs: [`${susUserList.name} wrapper`],
            args: [],
            innerLogic: toggleSusUserList
        },
        className: 'hideSusListBtn'
    }],
    nodeReturn: `${susUserList.name} wrapper`
})


const dateToString = date => typeof date == 'string' ? date : date.toLocaleDateString('en-GB');

const paymentTemplate = (payment, i, findUserFromCustId) => {
    const greyRow = i % 2 === 0 ? `greyRow` : '';
    return {
        html: `<div class="tableRow ${greyRow}">
    <div class='paymentTdIndex'>${i}</div>
    <div class="paymentTdEmail">${payment.receipt_email}</div>
    <div class="paymentTdDate">${dateToString(payment.date_created)}</div>
    <div class="paymentTdDescription">${payment.description}</div>
    <div class="paymentTdAmount">£${payment.amount / 100}</div>
    <div class="paymentTdStatus">${payment.payment_status}</div>
    <div class="paymentTdFailureMessage">${payment.failure_message}</div>
    </div>`,
        eventListeners: [{
            type: 'click',
            function: () => openModal(findUserFromCustId(payment)),
            className: 'tableRow'
        }],
        nodeReturn: ''
    }
}

const paymentTitlesTemplate = () => ({
    html: `<div class="tableRow tableHeader">
    <div class='paymentTdIndex'>Index</div>
    <div class="paymentTdEmail">Email</div>
    <div class="paymentTdDate">Date Paid</div>
    <div class="paymentTdDescription">Description</div>
    <div class="paymentTdAmount">Amount</div>
    <div class="paymentTdStatus">Status</div>
    <div class="paymentTdFailureMessage">Failure Message</div>
    <div class="scrollLineUp"></div>
    </div>`,
    eventListeners: [],
    nodeReturn: ''
})

const modalUserTemplate = user => {
    const paymentsHTMLtitles = user.payments.length == 0 ? '' : `<div class="modalPayment">
    <div class="modalPaymentTdDate">Date Paid</div>
    <div class="modalPaymentTdDescription">Payment Description</div>
    <div class="modalPaymentTdAmount">Payment Amount</div>
    <div class="modalPaymentTdStatus">Payment Status</div>
    <div class="modalPaymentTdFailureMessage">Payment Failure Message</div>
    </div>`
    const paymentsHTML = user.payments.map(payment => `<div class="modalPayment">
    <div class="modalPaymentTdDate">${dateToString(payment.date_created)}</div>
    <div class="modalPaymentTdDescription">${payment.description}</div>
    <div class="modalPaymentTdAmount">£${payment.amount / 100}</div>
    <div class="modalPaymentTdStatus">${payment.payment_status}</div>
    <div class="modalPaymentTdFailureMessage">${payment.failure_message}</div>
    </div>`).join('');
    return {
        html: `<div class="modalTitle">${user.title} ${user.first_name} ${user.last_name}</div>
        <div class="modalContent">
        <p>Email Address: ${user.email}</p>
        <p>Profession: ${user.profession}</p>
        <p>Membership Type: ${user.membership_type}</p>
        <p>Date Registered: ${dateToString(user.date_registered)}</p>
        <p>Date Last Logged In: ${dateToString(user.date_last_logged_in)}</p>
        <p>Date Paid To: ${dateToString(user.paid_to_date)}</p>
        <p>Username: ${user.username}</p>
        <p>Telephone: ${user.telephone}</p>
        <p>Mailing Address: ${user.mailing_address}</p>
        <p>Customer ID: ${user.customer_id}</p>
        <p>Certificate Type: ${user.certificate_type}</p>
        <p>Certificate Date: ${dateToString(user.certificate_date)}</p>
        <p>BrightSpace Id: ${user.bs_id}</p>
        <p>BrightSpace Last Accessed Date: ${dateToString(user.bs_last_accessed_date)}</p>
        <p>BrightSpace Enrolled Courses: ${user.bs_enrolled_courses.map(course => course.name).join(',\n')}</p>

        <p>Associated payments:</p>
        ${paymentsHTMLtitles}
        ${paymentsHTML}
        </div>`,
        eventListeners: [],
        nodeReturn: ''
    }
}

const dashBoardTemplate = (width, height) => ({
    html: `<canvas id="dashBoardCanvas" class="dashBoardCanvas" width="${width}px" height="${height}px"></canvas>`,
    eventListeners: [],
    nodeReturn: 'dashBoardCanvas'
})

const graphDataPointTemplate = (xPos, yPos, displayInfo) => ({
    html: `<div class="graphDataPoint" style="left:${xPos}px; top:${yPos}px"></div>`,
    eventListeners: [{
        type: 'mouseover',
        function: () => console.log(displayInfo),
        className: 'graphDataPoint'
    }],
    nodeReturn: ''
})


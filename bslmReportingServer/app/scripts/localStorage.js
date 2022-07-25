

/*
 * WARNING - FOR ANYONE MAINTAINING THIS CODE IN THE FUTURE
 * Credentials are stored as a plain text object in local storage.
 * This is fine because currently there is no third party javascript running.  It's not even a publicly served website.
 * If you want to add any 3rd party libraries or serve it publicly DO NOT DO THIS.  
 */


const retrieveFormData = () => {
    const formData = JSON.parse(localStorage.getItem('formData'));
    if (formData == null) return;
    getElement('usernameInput').value = formData.wpUsername;
    getElement('passwordInput').value = formData.wpPassword;
}

const setFormData = formData => localStorage.setItem('formData', JSON.stringify(formData));


retrieveFormData();

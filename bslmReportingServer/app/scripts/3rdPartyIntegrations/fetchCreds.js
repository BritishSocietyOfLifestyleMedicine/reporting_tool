'use strict';

const fetchCreds = async () => {
    const response = await fetch(`creds.store`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).catch(err => { throw appendErrMsg(err, 'failed getting creds file') });
    const json = await response.json().catch(err => appendErrMsg(err, 'Could not read creds file'));
    const tidyJson = tidyStoreJson(json);
    Object.freeze(tidyJson);
    return tidyJson;
}



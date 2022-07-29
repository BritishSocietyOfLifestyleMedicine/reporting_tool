'use strict';

/**
 * Generic OAuth2 implementation.  
 * @param {String} authUrl - URL of auth request endpoint
 * @param {String} tokenUrl - URL of Token request endpoint
 * @param {String} clientId - Client ID of app
 * @param {String} clientSecret - Client Secret of app
 * @param {String} redirect_uri - Redirect URL, this must end up at http://localhost:8000.  If http or localhost is not
 *                                allowed then it can be proxied through a webpage on AWS
 * @param {Array[Array[String]]} extraAuthHeaders - Array of extra headers to be added to the auth request call
 *                                                  Each extra header is itself a tuple (array of 2 in js) of key and value
 * @returns {Object} - The token object response containing the access_token, TTL, refresh_token, etc 
 */
const getOAuthAccessToken = async (authUrl, tokenUrl, clientId, clientSecret, redirect_uri, extraAuthHeaders = []) => {
    const refreshCode = await requestOAuth(authUrl, clientId, redirect_uri, extraAuthHeaders).catch(err => { throw err });
    const requestUrlParams = encodeUrlParams(getTokenRequestUrlParams(refreshCode, redirect_uri, clientId));
    const requestHeaders = encodeHeaders(getTokenRequestHeaders(clientId, clientSecret));
    return await oAuthFetchToken(tokenUrl, requestHeaders, requestUrlParams);
}

const getOAuthAccessTokenReqs = (refreshCode, tokenUrl, clientId, clientSecret, redirect_uri) => {
    const requestUrlParams = getTokenRequestUrlParams(refreshCode, redirect_uri, clientId);
    const requestHeaders = getTokenRequestHeaders(clientId, clientSecret);
    return {
        requestUrlParams: requestUrlParams,
        requestHeaders: requestHeaders,
        tokenUrl: tokenUrl
    }
}

const getTokenRequestUrlParams = (refreshCode, redirect_uri, clientId) => ({
        grant_type: 'authorization_code',
        code: refreshCode,
        redirect_uri: redirect_uri,
        client_id: clientId
});

const getTokenRequestHeaders = (clientId, clientSecret) => ({
    Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`
})

const encodeHeaders = headersObj => new Headers(Object.entries(headersObj));

const encodeUrlParams = urlParamsObj => new URLSearchParams(Object.entries(urlParamsObj));

const oAuthFetchToken = async (tokenUrl, requestHeaders, requestUrlParams) => {
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: requestUrlParams,
        redirect: 'follow'
    })
    const tokenObj = await response.json();
    if (response.status !== 200)
        throw appendErrMsg({ ...tokenObj, rawResponse: response }, 'Token failed to aquire');
    return tokenObj;
}



/**
 * Open a message window to the OAuth provider's website.  User can put in credentials and is redirected back to localhost
 * with the refresh code as a url param. 
 * Look at getOAuthAccessToken() for details on function paramaters.  
 * @returns {String} - Refresh code to call token endpoint.   
 */
const requestOAuth = async (authUrl, clientId, redirect_uri, extraHeaders = []) => {

    const url = getOAuthWindowUrl(authUrl, clientId, redirect_uri, extraHeaders);

    const authWindow = window.open(url,
        'MsgWindow', 'width=500,height=600');

    const urlWithRefreshCode = await new Promise((resolve, reject) => {
        const recCheckForHref = i => {
            // Getting href while domain is not localhost will throw an error, loop until no error
            // (and the page isnt pointing at a blank url) and we know we have the token

            if (authWindow == null || authWindow.closed) 
                reject(newErrMsg('OAuth login window closed prematurely'));

            try {
                if (authWindow.location.href.includes('about:blank')) throw 'try again';
                resolve(authWindow.location.href);
            }
            catch {
                if (i > 500) reject(newErrMsg('OAuth authentication timed out'))
                else setTimeout(() => recCheckForHref(i += 1), 500);
            }
        }
        recCheckForHref(0);
    })
    authWindow.close();
    return urlWithRefreshCode.split('?code=')[1];
}

/**
 * Adds on the url paramaters to the authUrl
 * Look at getOAuthAccessToken() for details on function paramaters. 
 * @returns {String} - the authUrl with the correct url paramaters appended
 */
const getOAuthWindowUrl = (authUrl, clientId, redirect_uri, extraHeaders) => {
    const params = new URLSearchParams([
        ['response_type', 'code'],
        ['client_id', clientId],
        ['redirect_uri', redirect_uri],
        ...extraHeaders
    ]);
    return authUrl + params.toString();
}




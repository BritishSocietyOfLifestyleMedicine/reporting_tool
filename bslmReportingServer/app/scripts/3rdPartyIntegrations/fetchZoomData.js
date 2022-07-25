'use strict';

const zoomAuthUrl = 'https://zoom.us/oauth/authorize?';
const zoomTokenUrl = 'https://zoom.us/oauth/token';

const getZoomToken = async () => {
    try {
        const token = await getOAuthAccessToken(zoomAuthUrl, zoomTokenUrl, localDataStore.zoomAuth.oauthClientId, 
            localDataStore.zoomAuth.oauthClientSecret, localDataStore.zoomAuth.oauthRedirectUri);
        localDataStore.setData({ zoomToken: token });
    } catch (err) {
        console.log(err);
    }
}
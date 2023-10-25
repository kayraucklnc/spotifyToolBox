const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: 'spotifyAccessToken',
    UPDATE_TIME: 'spotifyAccessTokenUpdateTime',
}

export const setAccessTokenToLocalStorage = (accessToken) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(
        LOCAL_STORAGE_KEYS.UPDATE_TIME,
        new Date().getTime().toString()
    )
}

export const getAccessTokenFromLocalStorage = () => ({
    accessToken: localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN),
    updateTime: localStorage.getItem(LOCAL_STORAGE_KEYS.UPDATE_TIME),
})
export const loadState = () => {
    try {
        const serializedState = localStorage.getItem('state');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

export const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('state', serializedState);
    } catch (err) {
        console.log(err);
    }
};

export const getToken = () => {
    return new Promise((resolve, reject) => {
        try {
            const token = localStorage.getItem('token');
            if (token && token !== 'undefined') {
                resolve({
                    headers: {'Authorization': `bearer ${token}`}
                });
            } else {
                reject('No token.');
            }
        } catch (err) {
            reject(err);
        }
    });
};
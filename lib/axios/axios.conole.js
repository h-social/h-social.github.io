
var axiosBackend = (function () {

    const apiInstance = axios.create({
        //baseURL: BackendApi , // Set your API base URL here
        baseURL: '' , // Set your API base URL here
        //timeout: 10000, // Set the timeout for requests (in milliseconds)
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const get = async (url, onSuccess, onError = null) => {
        try {
            const response = await apiInstance.get(url);
            onSuccess(response.data);
        } catch (error) {
            if(onError != null){
                onError(error)
            }
            console.error('GET Error:', error);
        }
    };

    const post = async (url, param, onSuccess, onError = null) => {
        try {
            const response = await apiInstance.post(url,param);
            onSuccess(response.data);
        } catch (error) {
            if(onError != null){
                onError(error)
            }
            console.error('GET Error:', error);
            noti.toast.error(error.message)
        }
    };

    const put = async (url, param, onSuccess, onError = null) => {
        try {
            const response = await apiInstance.put(url,param);
            onSuccess(response.data);
        } catch (error) {
            if(onError != null){
                onError(error)
            }
            console.error('GET Error:', error);
        }
    };
    //axiosApiConsole.writeLog()
    return {
        get: get,
        post: post,
        put: put,
    }
})();
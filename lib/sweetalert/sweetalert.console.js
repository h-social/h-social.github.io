export const noti = (function () {

    const toast = (function () {   
        
        const success = (message) => {
            Swal.fire({
                title: message,
                icon: 'success',
                timer: 1500,
                toast: true
            })
        }

        const error = (message) => {
            Swal.fire({
                title: message,
                icon: 'error',
                timer: 1500,
                toast: true
            })
        }

        const warning = (message) => {
            Swal.fire({
                title: message,
                icon: 'warning',
                timer: 1500,
                toast: true
            })
        }

        return {
            success: success,
            error: error,
            warning: warning
        }
    })();

    const alert = (function () {   
        const success = (message) => {
            Swal.fire({
                title: message,
                icon: 'success',
                showConfirmButton: false
            })
        }

        const error = (message) => {
            Swal.fire({
                title: message,
                icon: 'error',
                showConfirmButton: false
            })
        }

        const warning = (message) => {
            Swal.fire({
                title: message,
                icon: 'warning',
                showConfirmButton: false
            })
        }
        return {
            success: success,
            error: error,
            warning: warning
        }
    })();


    const confirm = (message, type, OnConfirm) => {
        Swal.fire({
            title: message,
            icon: type
        }).then((result) => {
            if (result.isConfirmed) {
                OnConfirm();
            }
        })
    }

    

    return {
        confirm: confirm,
        toast: toast,
        alert: alert
    }
})();
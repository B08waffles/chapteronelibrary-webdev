function postLoginUser() {
    // Get access to the create user form
    let loginUserForm = document.getElementById("login-user-form")

    // Convert the form fields into JSON
    let formDataJSON = JSON.stringify(Object.fromEntries(new FormData(loginUserForm)))
    console.log(formDataJSON)

    // Post the form JSON to the backend
    fetch("/api/users/login", {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: formDataJSON
    })
    .then(res => res.json())
    .then(res => {
        // Handle the response from the server
        console.log("user login request sent!")
        alert(res)
        // Redirect back to user list
        window.location.href = "list_users.html"
    })
    .catch(error => {
        // handle the error from the server
        console.log("user login request failed! " + error)
    })
    
}
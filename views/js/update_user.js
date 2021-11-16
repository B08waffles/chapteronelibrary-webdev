//// Load up existing data!
let urlParameters = new URLSearchParams(window.location.search)

// Access the user ID from the query string (ie. ?id=1)
let userId = urlParameters.get("id")

if (userId) {
    // Get existing user information
    fetch(`api/users/${userId}`)
        .then(res => res.json())
        .then(user => {
            console.log(user)
            // Push existing user information into the form inputs
            document.getElementById("userId").value = user.userID
            document.getElementById("firstName").value = user.firstName
            document.getElementById("lastName").value = user.lastName
            document.getElementById("email").value = user.email
            document.getElementById("username").value = user.username
            document.getElementById("password").value = user.password
            document.getElementById("accessRights").value = user.accessRights
        })
}

//// Post back updated data!
function postUpdateUser() {
    // Get access to the update user form
    let updateUserForm = document.getElementById("update-user-form")

    // Convert the form data into a JSON string
    let formDataJSON = JSON.stringify(Object.fromEntries(new FormData(updateUserForm)))

    // Post the JSON data to the API
    fetch("api/users/update", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: formDataJSON
    })
    .then(res => res.json())
    .then(response => {
        alert(response)
        // Redirect back to user list
        window.location.href = "list_users.html"
    })
}
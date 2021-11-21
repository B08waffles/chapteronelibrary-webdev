 /* fetch("api/users")
    .then(res => res.json())
    .then(users => {
        let userListSection = document.getElementById("user-list")

        for (let user of users) {
            userListSection.innerhtml += `
            <article class="user"> 
                <span>${user.userID}</span>
                <span>${user.username}</span>
                <span>${user.firstName}</span>
                <a href="update_user.ejs?id=${user.userID}">Edit</a>
                <a href="delete_user.ejs?id=${user.userID}">Delete</a> 
            </article>
            `
        } 
    }) */
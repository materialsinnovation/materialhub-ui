document.getElementById('loginform').addEventListener('submit', (event) => {
	event.preventDefault()
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	alert(username + " is logged in!");
	loginUser(username, password)
});

document.getElementById('logoutform').addEventListener('submit', (event) => {
	event.preventDefault()
	
	const authdata = tryGetAuth();

	let username = null;
	if (null !== authdata) {
		username = authdata["username"];
	}

	logoutUser();

	console.log(username);
	if (null !== authdata) {
		alert(authdata["username"] + " was logged out!");
	} else {
		alert("No one was logged in, so nothing has been done!");
	}
});
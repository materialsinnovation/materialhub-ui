document.getElementById('loginform').addEventListener('submit', (event) => {
	event.preventDefault()
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	console.log(username, password);
	login(username, password)
});
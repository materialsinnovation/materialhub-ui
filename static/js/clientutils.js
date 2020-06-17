const CORDRA_HTTPS_URL = 'https://149.165.157.156'

// TODO less hacky
/// Check if a string is nonempty
function nonEmpty(str) {
	return !!str;
}

function tryGetAuth() {
	const username = sessionStorage.getItem("username");
	const token = sessionStorage.getItem("authToken");

	console.log("Token is", token);
	console.log("Token empty is ", nonEmpty(token));

	if (nonEmpty(token)) {
		return { "username": username, "token": token };
	} else {
		return null;
	}
}

function saveAuthToken(username, token) {
	sessionStorage.setItem("username", username);
	sessionStorage.setItem("authToken", token);
}

async function sendHTTPRequest(endpoint, method, body) {
	url = CORDRA_HTTPS_URL + endpoint;

	// Options to pass to fetch request
	options = {
		method: method,
		headers: {
			'Content-Type': 'application/json'
		}
	};

	console.log(body);

	const authdata = tryGetAuth();

	// add authentication if we have it
	if (authdata !== null) {
		options['headers']['Authorization'] = 'Bearer ' + authdata['token'];
	}
	// add body if we have it
	if ((body !== null) || (method !== 'GET')) {
		options['body'] = body;
	}

	console.log(options);

	// wait for the promise to fulfill
	response = await fetch(url, options);
	console.log(response);
	return response;
}

async function postData(endpoint = '', data) {
	return await sendHTTPRequest(endpoint, 'POST', JSON.stringify(data));
}

async function getData(endpoint = '') {
	return await sendHTTPRequest(endpoint, 'GET');
}

//TODO DO NOT LOG TOKEN THIS IS INSECURE AND FOR DEBUG ONLY
async function loginUser(username, password) {
	console.log('auth started');
	const response = await postData(
		'/auth/token', {
		'grant_type': 'password',
		'username': username,
		'password': password
	});

	console.log('auth returned');
	console.log(response);

	if (!response.ok) {
		alert("Login failed!");
		return;
	}

	// now await the json content as well
	resp = await response.json();
	console.log(resp);

	// local copy of access token
	let access_token = resp.access_token;

	console.log(access_token, { 'token': access_token });

	// check token
	const intro_ret = postData('/auth/introspect', { 'token': access_token });
	console.log(intro_ret);

	// write back access token to global store
	saveAuthToken(username, access_token);
	console.log(access_token);
}

async function logoutUser(username, password) {
	sessionStorage.removeItem("username");
	sessionStorage.removeItem("authToken");
}


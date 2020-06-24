/// Set of helper utilities to manage a Cordra client

// TODO this belongs somewhere not here
const CORDRA_HTTPS_URL = 'https://149.165.157.156'

/// Check if a string is nonempty
function nonEmpty(str) {
	// TODO less hacky
	return !!str;
}

/// Get the currently-authenticated user if one exists and return username and token, else return null
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

/// Save auth information in session storage
function saveAuthToken(username, token) {
	sessionStorage.setItem("username", username);
	sessionStorage.setItem("authToken", token);
}

/// Send request to Cordra REST api, wraps fetch()
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
		console.log("POST request, body is ", body)

		options['body'] = body;
	}

	console.log(options);

	// wait for the promise to fulfill
	response = await fetch(url, options);
	console.log(response);
	return response;
}

/// Generic POST request wrapper
async function postData(endpoint = '', data) {
	return await sendHTTPRequest(endpoint, 'POST', JSON.stringify(data));
}

/// Generic GET request wrapper
async function getData(endpoint = '') {
	return await sendHTTPRequest(endpoint, 'GET');
}

/// Log a user into Cordra and store a token for later use
async function loginUser(username, password) {
	//TODO DO NOT LOG TOKEN THIS IS INSECURE AND FOR DEBUG ONLY
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


/// Dump all auth storage information
async function logoutUser(username, password) {
	sessionStorage.removeItem("username");
	sessionStorage.removeItem("authToken");
}


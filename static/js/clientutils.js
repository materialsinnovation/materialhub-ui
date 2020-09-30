/// Set of helper utilities to manage a Cordra client

// TODO this belongs somewhere not here
const CORDRA_HTTPS_URL = 'https://api.materialhub.org'

/// Check if a string is nonempty
function nonEmpty(str) {
	// TODO less hacky
	return !!str;
}

/// Get the currently-authenticated user if one exists and return username and token, else return null
function tryGetAuth() {
	const username = sessionStorage.getItem("username");
	const token = sessionStorage.getItem("authToken");

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

	// wait for the promise to fulfill
	response = await fetch(url, options);
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




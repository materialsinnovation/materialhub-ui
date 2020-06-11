const CORDRA_HTTPS_URL = 'https://149.165.157.156'

// TODO less hacky
/// Check if a string is nonempty
function nonEmpty(str){
	return !!str;
}

function tryGetAuthToken(){
	const username = sessionStorage.getItem("username");
	const token = sessionStorage.getItem("authToken");

	console.log("Token is", token)

	if (nonEmpty(token)){
		return token;
	}
	return undefined;
}

function saveAuthToken(username, token){
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

	const token = tryGetAuthToken();

	// add authentication if we have it
	if (token !== undefined) {
		options['headers']['Authorization'] = 'Bearer ' + token;
	}
	// add body if we have it
	if ((body !== undefined) || (method !== 'GET')) {
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

async function login(username, password) {
	console.log('auth started');
	const response = await postData(
		'/auth/token', {
		'grant_type': 'password',
		'username': username,
		'password': password
	});

	console.log('auth returned');
	console.log(response);
	
	if (!response.ok){
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

CORDRA_URL = 'http://localhost:8080'
CORDRA_HTTPS_URL = 'https://localhost:8443'

ACCESS_TOKEN = undefined;

async function sendHTTPRequest(endpoint, method, body){
    url = CORDRA_HTTPS_URL + endpoint;

    // Options to pass to fetch request
    options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // add authentication if we have it
    if (ACCESS_TOKEN !== undefined){
        options['headers']['Authorization'] = 'Bearer ' + ACCESS_TOKEN;
    }
    // add body if we have it
    if ((body !== undefined) || (method !== 'GET')) {
        options['body'] = body;
    }
    // console.log('url:', url);
    // console.log('options:', options);

    const response = await fetch(url, options);
    // parses JSON response into native JavaScript objects
    return await response.json();
}

async function postData(endpoint = '', data) {
	return await sendHTTPRequest(endpoint, 'POST', JSON.stringify(data));
}

async function getData(endpoint = '') {
	return await sendHTTPRequest(endpoint, 'GET');
}

async function authenticate() {
	// console.log('auth started');
	const ret = await postData(
		'/auth/token', {
			'grant_type': 'password',
			'username': 'admin',
			'password': 'obama'
		});
	// console.log('auth returned');

	// console.log(ret);

    // local copy of access token
    let access_token = ret.access_token;

    // console.log(access_token, {'token': access_token});

    // check token
    const intro_ret = await postData('/auth/introspect', {'token': access_token});
    // console.log(intro_ret);

    // write back access token to global store
    ACCESS_TOKEN = access_token;
	// console.log(ACCESS_TOKEN);
}

async function populateObjectTable() {
    const data = await getData('/objects?query=\*');
    // console.log('data is:', data);

    let results_div = document.getElementById('results_space');

    data_pretty = JSON.stringify(data.results, null, "\t");
    // console.log(data_pretty);
    results_div.innerHTML = "";
    results_div.appendChild(document.createTextNode(data_pretty));
}

// authenticate immediately on script load
document.addEventListener('DOMContentLoaded', function() {
	authenticate();
}, false);

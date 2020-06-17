/// Forward a search query to cordra and populate search page
async function runSearch(query){
	let response = await getData('/objects?query='+query);

	if (!response.ok){
		alert("Search failed!");
	}

	let results = await(response.json());
	let data_pretty = JSON.stringify(results, null, "\t");
	// console.log(data_pretty);
	let results_box = document.getElementById('results_space');

	results_box.innerHTML = "";
	results_box.appendChild(document.createTextNode(data_pretty));
}

// If we have a query string, search it now
document.addEventListener('DOMContentLoaded', function () {
	let params = new URLSearchParams(location.search);
	for (const [key, value] of params) { console.log(key, value); }

	let qstr = params.get("query");

	console.log(qstr);

	// if we have params, search for them
	if (nonEmpty(qstr)) {
		runSearch(qstr);
	}

}, false);
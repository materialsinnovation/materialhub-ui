/// Forward a search query to cordra and populate search page
async function runSearch(query) {
	let qstr = '?query=' + query;

	qstr += '&filter=["/id","/content/name"]';

	qstr += '&pageSize=20';

	qstr = encodeURI(qstr);

	let response = await getData('/objects' + qstr);

	if (!response.ok) {
		alert("Search failed!");
	}

	let results = await (response.json());
	populateTable(results["results"]);

}

async function createSearchResult(result) {

	const result_id = result.id;
	const result_name = result.content.name;

	let row_td = document.createElement("td");

	let name_div = document.createElement("div");
	let name_header = document.createElement("h5");
	let name_link = document.createElement("a");
	name_link.href = encodeURI("/resource?id=" + result_id);
	name_link.innerHTML = result_name;

	// Add tree of elements
	row_td.appendChild(name_div);
	name_div.appendChild(name_header);
	name_header.appendChild(name_link);

	let id_link = document.createElement("a")
	id_link.href = name_link.href;
	id_link.innerHTML = "ID: " + result_id;

	row_td.appendChild(id_link);

	return row_td;
}

async function populateTable(results) {
	// Guided by here: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template

	// Get references to the table body
	var table = document.getElementById("results_table");

	// TODO there has to be a better way in JS
	for (let i = 0; i < results.length; i++) {
		let new_row = table.insertRow();
		let row_td = await createSearchResult(results[i]);

		new_row.appendChild(row_td);
	}

}

// If we have a query string, search it now
document.addEventListener('DOMContentLoaded', function () {
	let params = new URLSearchParams(location.search);
	let qstr = params.get("query");

	// if we have params, search for them
	if (nonEmpty(qstr)) {
		const results = runSearch(qstr);
	}

}, false);
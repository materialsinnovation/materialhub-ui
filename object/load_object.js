async function populateObject(object_id) {
	let response = await getData('/objects/' + object_id);

	if (!response.ok) {
		alert('Object lookup failed!');

		let name_box = document.getElementById('object_name');
		name_box.innerHTML = 'Object ' + object_id + ' not found!';
		return;
	}

	let results = await (response.json());

	console.log(results);

	const id = results['@id'];

	console.log(id, object_id);

	console.assert(id == object_id);

	let data_pretty = JSON.stringify(results, null, '\t');
	let content_box = document.getElementById('object_content');

	// TODO: more useful formatting
	content_box.innerHTML = '';
	content_box.appendChild(document.createTextNode(data_pretty));

	let name_box = document.getElementById('object_name');
	name_box.innerHTML = results['name'];
}

// If we have a query string, search it now
document.addEventListener('DOMContentLoaded', function () {
	// get query string
	let params = new URLSearchParams(location.search);
	for (const [key, value] of params) { console.log(key, value); }

	console.log(params);

	let object_id = params.get('id');

	console.log(object_id);

	// if we have params, search for them
	if (nonEmpty(object_id)) {
		populateObject(object_id);
	} else {

		let name_box = document.getElementById('object_name');
		name_box.innerHTML = 'No object id provided!';
	}

}, false);
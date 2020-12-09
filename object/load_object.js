async function populateObject(object_id) {
	let response = await getData('/objects/' + object_id);

	if (!response.ok) {
		alert('Object lookup failed!');

		let name_box = document.getElementById('object_name');
		name_box.innerHTML = 'Object ' + object_id + ' not found!';
		return;
	}

	let results = await (response.json());

	const id = results['@id'];

	let data_pretty = JSON.stringify(results, null, '\t');
	let content_box = document.getElementById('object_content');

	// TODO: more useful formatting
	content_box.innerHTML = '';

	var ppopt = {}
	// ppopt['expanded'] = false;
	ppopt['styles'] = {
		'array': { 'th': { 'backgroundColor': '#e3c000', 'color': 'white' } }};

		var ppTable = prettyPrint(results, ppopt);

		// document.getElementById('debug').appendChild(ppTable);
		content_box.appendChild(ppTable);

		let name_box = document.getElementById('object_name');
		name_box.innerHTML = results['name'];
	}

	// If we have a query string, search it now
	document.addEventListener('DOMContentLoaded', function () {
		// get query string
		let params = new URLSearchParams(location.search);

		let object_id = params.get('id');

		// if we have params, search for them
		if (nonEmpty(object_id)) {
			let link_block = document.getElementById('link_block');
            var go_to = document.createTextNode('Go To: ');
            link_block.appendChild(go_to);
            let grid_link = document.createElement('a');
            grid_link.href = encodeURI('/resource?id=' + object_id);
            grid_link.innerHTML = 'Resource View';
            link_block.appendChild(grid_link);
            var br = document.createElement('br');
            link_block.appendChild(br);
            var hr = document.createElement('hr');
            link_block.appendChild(hr);
			populateObject(object_id);
		} else {

			let name_box = document.getElementById('object_name');
			name_box.innerHTML = 'No object id provided!';
		}

	}, false);
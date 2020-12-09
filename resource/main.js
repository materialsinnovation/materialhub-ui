async function getTemplate(url) {
    response = await fetch(url);
    return response;
}

async function renderTemplate(object_id) {
    let response_data = await getData('/objects/' + object_id + '?requestContext={"view":"resource"}');
    if (!response_data.ok) {
        alert('Object fetch failed!');
    }
    let data = await response_data.json();

    let response_template = await getTemplate('./content_block.mst');
    if (!response_template.ok) {
        alert('Template fetch failed!');
    }
    let template = await response_template.text();
    let content_block = document.getElementById('content_block');
    content_block.innerHTML = Mustache.render(template, data);
}

document.addEventListener(
    'DOMContentLoaded',
    function () {
        let params = new URLSearchParams(location.search);
        let object_id = params.get('id');
        if (nonEmpty(object_id)) {
            let link_block = document.getElementById('link_block');
            var go_to = document.createTextNode('Go To: ');
            link_block.appendChild(go_to);
            let grid_link = document.createElement('a');
            grid_link.href = encodeURI('/object?id=' + object_id);
            grid_link.innerHTML = 'Grid View';
            link_block.appendChild(grid_link);
            var br = document.createElement('br');
            link_block.appendChild(br);
            var hr = document.createElement('hr');
            link_block.appendChild(hr);
            renderTemplate(object_id);
        } else {
            let content_block = document.getElementById('content_block');
            content_block.innerHTML = 'No Object ID Provided';
        }
    },
    false
);

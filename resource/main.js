async function getTemplate(url) {
    response = await fetch(url);
    return response;
}

async function renderTemplate(object_id) {
    let response_data = await getData('/objects/' + object_id);
    if (!response_data.ok) {
        alert('Object fetch failed!');
    }
    let data = await response_data.json();

    let response_template = await getTemplate('./template.mst');
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
            renderTemplate(object_id);
        } else {
            let content_block = document.getElementById('content_block');
            content_block.innerHTML = 'No Object ID Provided';
        }
    },
    false
);

//All additional functions necessary to function can be found in static\js\pagination.js

async function runSearch(
    query,
    pageSize,
    pageNum,
    elmReq,
    elmEx,
    namesReq,
    namesEx
) {
    let qstr = createSearchStringFiltered(query, pageSize, pageNum);
    let response = await getData('/objects' + qstr);

    if (!response.ok) {
        alert('Search failed!');
    }

    let results = await response.json();
    let size = results.size;
    populateTable(results['results']);
    populateNavigation(
        query,
        pageSize,
        pageNum,
        size,
        elmReq,
        elmEx,
        namesReq,
        namesEx
    );
    duplicateNavigation();
}

// If we have a query string, search it now
document.addEventListener('DOMContentLoaded', function () {
    let params = new URLSearchParams(location.search);
    let query = params.get('query');
    let pageSize = parseInt(params.get('pageSize'));
    let pageNum = parseInt(params.get('pageNum'));

    if (isNaN(pageNum)) {
        pageNum = 0;
        params.set('pageNum', pageNum);
    }

    if (isNaN(pageSize)) {
        pageSize = 10;
        params.set('pageSize', pageSize);
    }

    document.getElementById('searchBox').value = query;
    document.getElementById('pageSize').value = pageSize;

    if (nonEmpty(query)) {
        const results = runSearch(query, pageSize, pageNum);
    }
});

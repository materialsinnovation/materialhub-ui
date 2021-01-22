// Forward a search query to cordra and populate search page
async function runSearch(query, pageSize, pageNum) {
    let qstr = createSearchString(query, pageSize, pageNum);

    let response = await getData('/objects' + qstr);

    if (!response.ok) {
        alert('Search failed!');
    }

    let results = await response.json();
    let size = results.size;
    //let numberOfPages = Math.ceil(results.size / results.pageSize);
    populateTable(results['results']);
    populateNavigation(query, pageSize, pageNum, size);
    duplicateNavigation();
}

async function createSearchResult(result) {
    const result_id = result.id;
    const result_name = result.content.name;
    const result_thumbnail = result.content.thumbnailUrl;

    let row_td = document.createElement('td');

    let name_div = document.createElement('div');
    let name_header = document.createElement('h5');
    let name_link = document.createElement('a');
    let thumbnail_link = document.createElement('img');
    name_link.href = encodeURI('/resource?id=' + result_id);
    name_link.innerHTML = result_name;

    // Add tree of elements
    row_td.appendChild(name_div);
    name_div.appendChild(name_header);
    name_header.appendChild(name_link);

    if (nonEmpty(result_thumbnail)) {
        thumbnail_link.src = result_thumbnail[0];
        thumbnail_link.height = '50';
        //$('img').addClass = 'img-fluid img-thumbnail'; //need to figure out how to pass through a class attribute
        name_div.appendChild(thumbnail_link);
    }

    let id_link = document.createElement('a');
    id_link.href = name_link.href;
    id_link.innerHTML = 'ID: ' + result_id;

    row_td.appendChild(id_link);

    //console.log(row_td);

    return row_td;
}

async function populateTable(results) {
    //console.log(results);
    // Guided by here: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template

    // Get references to the table body
    var table = document.getElementById('results_table');

    // TODO there has to be a better way in JS
    for (let i = 0; i < results.length; i++) {
        let new_row = table.insertRow();
        let row_td = await createSearchResult(results[i]);

        new_row.appendChild(row_td);
    }
}

async function populateNavigation(query, pageSize, pageNum, size) {
    let numberOfPages = Math.ceil(size / pageSize);
    var resultsDiv = document.getElementById('resultsShowing');
    var totalResults = document.createElement('b');
    var rangeOfTable = getRangeTextForPage(pageNum, pageSize, size);
    var numberResults = document.createTextNode(
        'Showing ' + rangeOfTable + ' of ' + size
    );
    totalResults.appendChild(numberResults);
    resultsDiv.appendChild(totalResults);

    var nav = document.getElementById('pageNav');
    var list = document.createElement('nav');
    list.setAttribute('class', 'nav nav-pills');

    var startPageNum = startingPaginationNumber(pageNum, numberOfPages);
    var endPageNum = endingPaginationNumber(pageNum, numberOfPages);

    var qstrFirst = createNewUrlString(query, pageSize, 0);
    var linkFirst = document.createElement('a');
    linkFirst.setAttribute('class', 'nav-item nav-link border');
    linkFirst.setAttribute('href', qstrFirst);
    var node = document.createTextNode('First');
    linkFirst.appendChild(node);
    list.appendChild(linkFirst);

    var linkDots = document.createElement('a');
    linkDots.setAttribute('class', 'nav-item nav-link');
    var node = document.createTextNode(' . . . ');
    linkDots.appendChild(node);
    list.appendChild(linkDots);

    for (let i = startPageNum; i < endPageNum; i++) {
        let qstr = createNewUrlString(query, pageSize, i);
        var link = document.createElement('a');

        if (i == pageNum) {
            link.setAttribute('class', 'nav-item nav-link border active');
        } else {
            link.setAttribute('class', 'nav-item nav-link border');
        }

        link.setAttribute('href', qstr);
        var node = document.createTextNode(i + 1);
        link.appendChild(node);
        list.appendChild(link);
    }

    var linkDots = document.createElement('a');
    linkDots.setAttribute('class', 'nav-item nav-link');
    var node = document.createTextNode(' . . . ');
    linkDots.appendChild(node);
    list.appendChild(linkDots);

    var qstrLast = createNewUrlString(query, pageSize, numberOfPages - 1);
    var linkLast = document.createElement('a');
    linkLast.setAttribute('class', 'nav-item nav-link border');
    linkLast.setAttribute('href', qstrLast);
    var node = document.createTextNode('Last');
    linkLast.appendChild(node);
    list.appendChild(linkLast);

    nav.appendChild(list);
}

function duplicateNavigation() {
    var pageDiv = document.getElementById('pageNav');
    var duplicateDiv = pageDiv.cloneNode(true);
    var secondPageNav = document.getElementById('bottomPageNav');
    secondPageNav.appendChild(duplicateDiv);
}

function createSearchString(query, pageSize, pageNum) {
    let qstr = '?query=' + query;
    qstr += '&filter=["/id","/content/name","/content/thumbnailUrl"]';
    qstr += '&pageSize=' + pageSize;
    qstr += '&pageNum=' + pageNum;
    qstr = encodeURI(qstr);

    return qstr;
}

function createNewUrlString(query, pageSize, pageNum) {
    //let baseUrl = window.location.host + window.location.pathname;
    let url =
        '?query=' + query + '&pageSize=' + pageSize + '&pageNum=' + pageNum;

    return url;
}

function getRangeTextForPage(pageNum, pageSize, size) {
    var firstResultOnPageNumber = pageNum * pageSize + 1;
    var lastResultOnPageNumber = (pageNum + 1) * pageSize;
    if (size != -1 && lastResultOnPageNumber > size)
        lastResultOnPageNumber = size;
    return firstResultOnPageNumber + ' to ' + lastResultOnPageNumber;
}

function startingPaginationNumber(currentPageNumber, totalNumOfPages) {
    var result = 0;
    if (currentPageNumber < 5) {
        result = 0;
    } else {
        result = currentPageNumber - 4;
    }
    if (totalNumOfPages - result < 10) {
        result = totalNumOfPages - 10;
    }
    if (result < 0) {
        result = 0;
    }
    return result;
}

function endingPaginationNumber(currentPageNumber, totalNumOfPages) {
    var result = null;
    if (currentPageNumber >= 5) {
        result = currentPageNumber + 5;
    } else {
        result = 9;
    }
    if (result > totalNumOfPages) {
        result = totalNumOfPages;
    }
    return result;
}

// If we have a query string, search it now
document.addEventListener('DOMContentLoaded', function () {
    let params = new URLSearchParams(location.search);
    let qstr = params.get('query');
    let pageSize = parseInt(params.get('pageSize'));
    let pageNum = parseInt(params.get('pageNum'));

    if (pageNum == null) {
        pageNum = 0;
        params.set('pageNum', pageNum);
    }

    if (nonEmpty(qstr)) {
        const results = runSearch(qstr, pageSize, pageNum);
    }
});

const unencodedQueryInitial = 'internal.pointsAt:20.500.12772/elements/';
const unencodedDelimiter = ' AND internal.pointsAt:20.500.12772/elements/';
const unencodedNotDelimiter =
    ' AND NOT internal.pointsAt:20.500.12772/elements/';

//delimiter to exclude elements only *:*

let qParam = new RegExp(unencodedDelimiter, 'g');
let qNotParam = new RegExp(unencodedNotDelimiter, 'g');

//not needed, leaving for if needed in the future
//const queryParameter = '%20AND%20internal.pointsAt%3A20.500.12772/elements/';
//const queryInitial = 'internal.pointsAt%3A20.500.12772/elements/';

var elementsRequired = [];
var elementsNameRequired = [];
var elementsExcluded = [];
var elementsNameExcluded = [];
var elementsSelected = [];

function elementClick(ev) {
    var requiredbox = document.getElementById('elementsRequired');
    var excludedbox = document.getElementById('elementsExcluded');
    var searchBox = document.getElementById('searchBox');
    var elt_num = ev.target.id;
    var elt_name = ev.target.title + ',';
    var oldrequired = requiredbox.value;
    var oldexcluded = excludedbox.value;

    if (oldrequired.indexOf(elt_name) != -1) {
        requiredbox.value = oldrequired.replace(elt_name, '');
        document.getElementById(ev.target.id).style.backgroundColor = '#C0111F';
        document.getElementById(ev.target.id).style.color = '#ffffff';
        elementsRequired.splice(elementsRequired.indexOf(elt_num), 1);
        elementsNameRequired.splice(
            elementsNameRequired.indexOf(ev.target.title),
            1
        );
        elementsExcluded.push(elt_num);
        elementsNameExcluded.push(ev.target.title);
        excludedbox.value = oldexcluded + elt_name;
    } else if (oldexcluded.indexOf(elt_name) != -1) {
        excludedbox.value = oldexcluded.replace(elt_name, '');
        document.getElementById(ev.target.id).style.backgroundColor = null;
        document.getElementById(ev.target.id).style.color = null;
        elementsExcluded.splice(elementsExcluded.indexOf(elt_num), 1);
        elementsNameExcluded.splice(
            elementsNameExcluded.indexOf(ev.target.title),
            1
        );
    } else {
        requiredbox.value = oldrequired + elt_name;
        document.getElementById(ev.target.id).style.backgroundColor = '#000000';
        document.getElementById(ev.target.id).style.color = '#ffffff';
        elementsRequired.push(elt_num);
        elementsNameRequired.push(ev.target.title);
    }
    //find a way to run outside the click event
    var requiredStr = elementsRequired.toString();
    var reqRepStr = requiredStr.replace(/,/g, unencodedDelimiter);
    var excludedStr = elementsExcluded.toString();
    var excRepStr = excludedStr.replace(/,/g, unencodedNotDelimiter);

    if (elementsExcluded.length === 0) {
        searchBox.value = unencodedQueryInitial + reqRepStr;
    } else if (elementsRequired.length === 0) {
        searchBox.value = '*:*' + unencodedNotDelimiter + excRepStr;
    } else {
        searchBox.value =
            unencodedQueryInitial +
            reqRepStr +
            unencodedNotDelimiter +
            excRepStr;
    }
}

async function runSearch(query, pageSize, pageNum, elmReq, elmEx) {
    let qstr = createSearchString(query, pageSize, pageNum);
    let response = await getData('/objects' + qstr);

    if (!response.ok) {
        alert('Search failed!');
    }

    let results = await response.json();
    let size = results.size;
    populateTable(results['results']);
    populateNavigation(query, pageSize, pageNum, size, elmReq, elmEx);
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

async function populateNavigation(
    query,
    pageSize,
    pageNum,
    size,
    elmReq,
    elmEx
) {
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

    if (startPageNum != 0) {
        var qstrFirst = createNewUrlString(query, pageSize, 0, elmReq, elmEx);
        var linkFirst = document.createElement('a');
        linkFirst.setAttribute('class', 'nav-item nav-link border');
        linkFirst.setAttribute('href', qstrFirst);
        var node = document.createTextNode(1);
        linkFirst.appendChild(node);
        list.appendChild(linkFirst);

        //could make this into a function since it is used twice and would simplify code
        var firstDots = document.createElement('a');
        firstDots.setAttribute('class', 'nav-item nav-link');
        var nodeDotsFirst = document.createTextNode(' . . . ');
        firstDots.appendChild(nodeDotsFirst);
        list.appendChild(firstDots);
    }

    for (let i = startPageNum; i < endPageNum; i++) {
        let qstr = createNewUrlString(query, pageSize, i, elmReq, elmEx);
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

    if (endPageNum != numberOfPages) {
        var lastDots = document.createElement('a');
        lastDots.setAttribute('class', 'nav-item nav-link');
        var nodeDotsLast = document.createTextNode(' . . . ');
        lastDots.appendChild(nodeDotsLast);
        list.appendChild(lastDots);

        var qstrLast = createNewUrlString(
            query,
            pageSize,
            numberOfPages - 1,
            elmReq,
            elmEx
        );
        var linkLast = document.createElement('a');
        linkLast.setAttribute('class', 'nav-item nav-link border');
        linkLast.setAttribute('href', qstrLast);
        var nodeLast = document.createTextNode(numberOfPages);
        linkLast.appendChild(nodeLast);
        list.appendChild(linkLast);
    }

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
    //qstr += '&filter=["/id","/content/name","/content/thumbnailUrl"]';
    qstr += '&pageSize=' + pageSize;
    qstr += '&pageNum=' + pageNum;
    qstr = encodeURI(qstr);

    return qstr;
}

function createNewUrlString(query, pageSize, pageNum, elmReq, elmEx) {
    let url =
        '?query=' +
        query +
        '&pageSize=' +
        pageSize +
        '&pageNum=' +
        pageNum +
        '&elementsRequired=' +
        elmReq +
        '&elementsExcluded=' +
        elmEx;
    url = encodeURI(url);
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

function filterElements(arr, term) {
    return arr.filter(function (el) {
        return el.indexOf(term) !== -1;
    });
}

function resetPage() {
    window.location.href = '?query=&pageSize=1';
    elementsRequired = [];
    elementsNameRequired = [];
    elementsExcluded = [];
    elementsNameExcluded = [];
    elementsSelected = [];
}

function submitSearch() {
    //need to write this function to make the current working more explicity not implicit
    let query = document.getElementById('searchBox').value;
    let elmReq = elementsNameRequired;
    let elmEx = elementsNameExcluded;
    let pageSize = document.getElementById('pageSize').value;
    let pageNum = 0;

    let newURL = createNewUrlString(query, pageSize, pageNum, elmReq, elmEx);
    window.location.href = newURL;

    if (nonEmpty(query)) {
        const results = runSearch(query, pageSize, pageNum, elmReq, elmEx);
    }
}

// If we have a query string, search it now
document.addEventListener('DOMContentLoaded', function () {
    let params = new URLSearchParams(location.search);
    let query = params.get('query');
    let pageSize = parseInt(params.get('pageSize'));
    let pageNum = parseInt(params.get('pageNum'));

    if (elementsRequired.length != 0) {
        var elmReq = params.set(
            'elementsRequired',
            elementsRequired.toString()
        );
        return elmReq;
    } else {
        var elmReq = params.get('elementsRequired');
    }

    if (elementsExcluded.length != 0) {
        var elmEx = params.set('elementsExcluded', elementsExcluded.toString());
    } else {
        var elmEx = params.get('elementsExcluded');
    }

    // ZTT: need to parse query convert to list of element strings
    // ZTT: need to populate elementsRequired and elementsExcluded variables

    let deconstructedQueryStr = query
        .replace(unencodedQueryInitial, '+')
        .replace(qParam, ',+')
        .replace(qNotParam, ',-');
    console.log('deconstructedQueryStr: ' + deconstructedQueryStr);

    // if (query != null) {
    //     elementsSelected = deconstructedQueryStr.split(',');
    //     elementsRequired = filterElements(elementsSelected, '+')
    //         .toString()
    //         .replace(/[.*+?^${}()|[\]\\]/g, '')
    //         .split(',');
    //     elementsExcluded = filterElements(elementsSelected, '-')
    //         .toString()
    //         .replace(/-/g, '')
    //         .split(',');
    // }

    if (isNaN(pageNum)) {
        pageNum = 0;
        params.set('pageNum', pageNum);
    }

    if (isNaN(pageSize)) {
        pageSize = 10;
        params.set('pageSize', pageSize);
    }

    // if (elmReq === null) {
    //     elmReq = document.getElementById('elementsRequired').value;
    //     params.set('elementsRequired', elmReq);
    // }

    document.getElementById('searchBox').value = query;
    document.getElementById('pageSize').value = pageSize;
    document.getElementById('elementsRequired').value = elmReq;
    document.getElementById('elementsExcluded').value = elmEx;

    let elementsNameRequired = elmReq.split(',');

    if (nonEmpty(query)) {
        const results = runSearch(query, pageSize, pageNum, elmReq, elmEx);
    }
});

// let params = new URLSearchParams(location.search);
//     let query = params.get('query');
//     let pageSize = parseInt(params.get('pageSize'));
//     let pageNum = parseInt(params.get('pageNum'));
//     let elmReq = params.get('elementsRequired');
//     let elmEx = params.get('elementsExcluded');

//     if (isNaN(pageNum)) {
//         pageNum = 0;
//         params.set('pageNum', pageNum);
//     }

//     if (isNaN(pageSize)) {
//         pageSize = 10;
//         params.set('pageSize', pageSize);
//     }

//     if (typeof elmReq === 'undefined') {
//         elmReq = elementsNameRequired;
//     }

//     if (typeof elmEx === 'undefined') {
//         elmEx = elementsNameExcluded;
//     }

//     document.getElementById('searchBox').value = query;
//     document.getElementById('pageSize').value = pageSize;
//     document.getElementById('elementsRequired').value = elmReq;
//     document.getElementById('elementsExcluded').value = elmEx;

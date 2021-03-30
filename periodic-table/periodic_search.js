const unencodedQueryInitial = 'internal.pointsAt:20.500.12772/elements/';
const unencodedDelimiter = ' AND internal.pointsAt:20.500.12772/elements/';
const unencodedNotDelimiter =
    ' AND NOT internal.pointsAt:20.500.12772/elements/';

//delimiter to exclude elements only *:*

//Defining the global arrays
let elementsRequired = [];
let elementsNameRequired = [];
let elementsExcluded = [];
let elementsNameExcluded = [];

//If we have a query string, search it now
document.addEventListener('DOMContentLoaded', function () {
    let params = new URLSearchParams(location.search);
    let query = params.get('query');
    let pageSize = parseInt(params.get('pageSize'));
    let pageNum = parseInt(params.get('pageNum'));
    let elmReq = params.get('elementsRequired');
    let elmEx = params.get('elementsExcluded');
    let namesReq = params.get('namesRequired');
    let namesEx = params.get('namesExcluded');

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

    //This section throws an error whenever namesReq = null (aka there are no search parameters in the URL yet)
    //I don't know how to fix this error, but it does not seem to be affecting the function of the search
    if (namesReq !== '') {
        document.getElementById('elementsRequired').value =
            namesReq.split(',') + ',';
    }
    if (namesEx !== '') {
        document.getElementById('elementsExcluded').value =
            namesEx.split(',') + ',';
    }

    if (elmReq !== '') {
        let elmReqArray = elmReq.split(',');
        for (i = 0; i < elmReqArray.length; i++) {
            document.getElementById(elmReqArray[i]).style.backgroundColor =
                '#000000';
            document.getElementById(elmReqArray[i]).style.color = '#ffffff';
        }
    }

    if (elmEx !== '') {
        let elmExArray = elmEx.split(',');
        for (i = 0; i < elmExArray.length; i++) {
            document.getElementById(elmExArray[i]).style.backgroundColor =
                '#C0111F';
            document.getElementById(elmExArray[i]).style.color = '#ffffff';
        }
    }

    if (nonEmpty(query)) {
        const results = runSearch(
            query,
            pageSize,
            pageNum,
            elmReq,
            elmEx,
            namesReq,
            namesEx
        );
    }

    //This could probably be streamlined in the future, but currently does the job fine
    if (namesReq !== '') {
        elementsNameRequired = namesReq.split(',');
    } else {
        elementsNameRequired = [];
    }
    if (namesEx !== '') {
        elementsNameExcluded = namesEx.split(',');
    } else {
        elementsNameExcluded = [];
    }
    if (elmReq !== '') {
        elementsRequired = elmReq.split(',');
    } else {
        elementsRequired = [];
    }
    if (elmEx !== '') {
        elementsExcluded = elmEx.split(',');
    } else {
        elementsExcluded = [];
    }
});

//Function to add/remove elements to the global arrays required or excluded
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

//Function to search the Cordra database once given all the necesary information
async function runSearch(
    query,
    pageSize,
    pageNum,
    elmReq,
    elmEx,
    namesReq,
    namesEx
) {
    let qstr = createSearchString(query, pageSize, pageNum);
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

//Function to create the search result table
//Can and should be reworked to be more streamlined
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

//Function called within the createSearchResult function to create all necessary entries in the table
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
    elmEx,
    namesReq,
    namesEx
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
        var qstrFirst = createNewUrlString(
            query,
            pageSize,
            0,
            elmReq,
            elmEx,
            namesReq,
            namesEx
        );
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
        let qstr = createNewUrlString(
            query,
            pageSize,
            i,
            elmReq,
            elmEx,
            namesReq,
            namesEx
        );
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
            elmEx,
            namesReq,
            namesEx
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

function createNewUrlString(
    query,
    pageSize,
    pageNum,
    elmReq,
    elmEx,
    namesReq,
    namesEx
) {
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
        elmEx +
        '&namesRequired=' +
        namesReq +
        '&namesExcluded=' +
        namesEx;
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
    let query = document.getElementById('searchBox').value;
    let elmReq = elementsRequired;
    let elmEx = elementsExcluded;
    let pageSize = document.getElementById('pageSize').value;
    let pageNum = 0;
    let namesReq = elementsNameRequired;
    let namesEx = elementsNameExcluded;

    let newURL = createNewUrlString(
        query,
        pageSize,
        pageNum,
        elmReq,
        elmEx,
        namesReq,
        namesEx
    );
    window.location.href = newURL;
}

//not needed, leaving for if needed in the future
//const queryParameter = '%20AND%20internal.pointsAt%3A20.500.12772/elements/';
//const queryInitial = 'internal.pointsAt%3A20.500.12772/elements/';

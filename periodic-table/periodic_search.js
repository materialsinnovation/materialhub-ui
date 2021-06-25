const ELEM_QUERY_BASE = 'internal.pointsAt:20.500.12772/elements/'
const UNENCODED_AND_DELIMITER = ' AND ' + ELEM_QUERY_BASE;
const UNENCODED_NOT_DELIMITER = ' AND NOT ' + ELEM_QUERY_BASE;

//delimiter to exclude elements only *:*

//Defining the global arrays
let elementsRequired = [];
let elementsNameRequired = [];
let elementsExcluded = [];
let elementsNameExcluded = [];

// //  Colors to mark required and excluded elements
// const COLOR_REQUIRED = '#000000';
// const COLOR_EXCLUDED = '#C0111F';

// // Start with black font, but when we require/exclude, use white font
// const PT_FONT_COLOR_DEFAULT = '#000000';
// const PT_FONT_COLOR_MODIFIED = '#FFFFFF';

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

    // populate global arrays
    elementsNameRequired = split_str(namesReq);
    elementsNameExcluded = split_str(namesEx);
    elementsRequired = split_str(elmReq);
    elementsExcluded = split_str(elmEx);


    // now populate the chart from these arrays
    populateElementLists();
    populatePeriodicTable();

    // now run the query itself and get the results
    if (nonEmpty(query)) {
        runSearch(
            query,
            pageSize,
            pageNum,
            elmReq,
            elmEx,
            namesReq,
            namesEx
        );
    }
});

function split_str(str_to_split) {
    /// Split a string (by commas) into an array, or return and empty array if the string is empty
    if (nonEmpty(str_to_split)) {
        return str_to_split.split(',');
    }
    return [];
}

function populateElementLists() {
    /// Populate the periodic table colorings and element lists using the global arrays
    if (elementsNameRequired.length > 0) {
        document.getElementById('elementsRequired').value = String(elementsNameRequired);
    }
    else {
        // unset value to let placeholder fall back
        document.getElementById('elementsRequired').value = null;
    }
    if (elementsNameExcluded.length > 0) {
        document.getElementById('elementsExcluded').value = String(elementsNameExcluded);
    }
    else {
        // unset value to let placeholder fall back
        document.getElementById('elementsExcluded').value = null;
    }
}

function populatePeriodicTable() {
    // Mark those elements are required or excluded
    for (i = 0; i < elementsRequired.length; i++) {
        markRequired(elementsRequired[i]);
    }

    for (i = 0; i < elementsExcluded.length; i++) {
        markExcluded(elementsExcluded[i]);
    }
}

function markRequired(elem) {
    /// mark element as required in the periodic table
    document.getElementById(elem).classList.add('required');
    document.getElementById(elem).classList.remove('excluded');
}

function markExcluded(elem) {
    /// mark element as excluded in the periodic table
    document.getElementById(elem).classList.add('excluded');
    document.getElementById(elem).classList.remove('required');
}

function unmarkElement(elem) {
    /// remove element markings in the periodic table
    document.getElementById(elem).classList.remove('excluded');
    document.getElementById(elem).classList.remove('required');
}

function elementClick(ev) {
    // Function to add/remove elements to the global arrays required or excluded
    var requiredbox = document.getElementById('elementsRequired');
    var excludedbox = document.getElementById('elementsExcluded');
    var searchBox = document.getElementById('searchBox');
    var elt_num = ev.target.id;
    var elt_name = ev.target.title;
    var oldrequired = requiredbox.value;
    var oldexcluded = excludedbox.value;


    // is the element required? if so, mark it excluded    
    if (elementsRequired.indexOf(elt_num) != -1) {
        // delete from required elements lists
        removeArrayElem(elementsRequired, elt_num);
        removeArrayElem(elementsNameRequired, elt_name);

        // and add to excluded lists
        elementsExcluded.push(elt_num);
        elementsNameExcluded.push(ev.target.title);

        // now mark as excluded in the table
        markExcluded(elt_num);
    } else if (elementsExcluded.indexOf(elt_num) != -1) {
        // if the element was excluded, mark it as nothing now
        removeArrayElem(elementsExcluded, elt_num);
        removeArrayElem(elementsNameExcluded, elt_name);

        unmarkElement(elt_num);
    } else {
        // add element to required list
        elementsRequired.push(elt_num);
        elementsNameRequired.push(elt_name);
        markRequired(elt_num);
    }

    // now repopulate the element list boxes
    populateElementLists();

    console.log('elt_num', elt_name, elt_num);
    console.log(elementsRequired);
    console.log(elementsExcluded);

    // now build a new search box string
    var requiredStr = elementsRequired.toString();
    var reqRepStr = ELEM_QUERY_BASE + requiredStr.replace(/,/g, UNENCODED_AND_DELIMITER);

    var excludedStr = elementsExcluded.toString();
    var excRepStr = UNENCODED_NOT_DELIMITER + excludedStr.replace(/,/g, UNENCODED_NOT_DELIMITER);

    // default to empty search string
    var search_str = "";


    // TODO this logic kinda sucks

    // are any elements required?
    if (elementsRequired.length === 0) {
        // if no elements are required but some are excluded, make sure we start with a wildcard
        if (elementsExcluded.length > 0) {
            search_str = '*:*' + excRepStr;
        }
    }
    else {
        // we know we have elements required
        search_str = reqRepStr;

        // if elements are excluded, add that 
        if (elementsExcluded.length > 0) {
            search_str = search_str + excRepStr;
        }
    }

    // Now set the search box string
    searchBox.value = search_str;
}

function removeArrayElem(arr, elem_to_del) {
    /// Use splice to remove the element elem in the array 'arr'
    // Does nothing if the element does not exist
    var ind = arr.indexOf(elem_to_del);
    if (ind != -1) {
        arr.splice(ind, 1);
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
    // How many pages did we get back
    let numberOfPages = Math.ceil(size / pageSize);

    // Add a count of the number of results
    var resultsDiv = document.getElementById('resultsShowing');
    var totalResults = document.createElement('b');
    var rangeOfTable = getRangeTextForPage(pageNum, pageSize, size);
    var numberResults = document.createTextNode(
        'Showing ' + rangeOfTable + ' of ' + size
    );
    totalResults.appendChild(numberResults);
    resultsDiv.appendChild(totalResults);

    // now create navbar
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
    let resetURL = createNewUrlString('', 10, 0, '', '', '', '');
    window.location.href = resetURL;
    elementsRequired = [];
    elementsNameRequired = [];
    elementsExcluded = [];
    elementsNameExcluded = [];
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

//All additional functions necessary to function can be found in static\js\pagination.js

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

function resetPage() {
    let resetURL = createNewUrlString('', 10, 0, '', '', '', '');
    window.location.href = resetURL;
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

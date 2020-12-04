const baseURI = 'http://mmsd-lims-dev:8080/objects/';
const searchBaseURI = 'https://api.materialhub.org/#objects/';
const queryParameter = '%20AND%20internal.pointsAt%3A20.500.12772/elements/';
const queryBase = '?query=internal.pointsAt%3A20.500.12772/elements/';

fetch('./elements.json')
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        elementsInfo = data;
        return elementsInfo;
    });

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

    let response_template = await getTemplate('./searchtemplate.mst');
    if (!response_template.ok) {
        alert('Template fetch failed!');
    }
    let template = await response_template.text();
    let content_block_1 = document.getElementById('content_block_1');
    content_block_1.innerHTML = Mustache.render(template, data);
}

document.addEventListener(
    'DOMContentLoaded',
    function () {
        let params = new URLSearchParams(location.search);
        let object_id = params.get('id');
        if (nonEmpty(object_id)) {
            renderTemplate(object_id);
        } else {
            let content_block_1 = document.getElementById('content_block_1');
            content_block_1.innerHTML = 'No Object ID Provided';
        }
    },
    false
);

function add(ev) {
    var elt_name = ev.target.id + '-';
    var formulabox = document.getElementById('FormulaBox');
    var oldformula = formulabox.value;

    if (oldformula.indexOf(elt_name) != -1) {
        formulabox.value = oldformula.replace(elt_name, '');
        document.getElementById(ev.target.id).style.backgroundColor = '#F4F4F4';
        document.getElementById(ev.target.id).style.color = '#000000';
    } else {
        formulabox.value = oldformula + elt_name + '';
        document.getElementById(ev.target.id).style.backgroundColor = '#000000';
        document.getElementById(ev.target.id).style.color = '#ffffff';
    }
}

async function search() {
    var formulabox = document.getElementById('FormulaBox').value;
    var shortenedStr = formulabox.substring(0, formulabox.length - 1);
    //var replacedStr = shortenedStr.replace(/-/g, queryParameter);
    var splitStr = shortenedStr.split('-');
    //console.log(splitStr);
    var numStr = matchElementName2Number(splitStr);
    //console.log(numStr);
    var searchStr = convertString2Search(numStr);
    //console.log(searchStr);
}

// document.getElementById('Search').addEventListener('click', function () {
//     var formulabox = document.getElementById('FormulaxBox').value;
//     var str = formulabox;
//     var shortenedStr = str.substring(0, str.length - 1);
//     var replacedStr = shortenedStr.replace(/-/g, queryParameter);
//     this.searchstring = replacedStr;
//     console.log(this.searchstring);
// });

function matchElementName2Number(string) {
    var newStr = [];
    for (i in string) {
        newStr.push(elementsInfo[string[i]]);
    }
    return newStr;
}

function convertString2Search(string) {
    var numStr = string.toString();
    //console.log(numStr);
    var finStr = queryBase + numStr.replace(/,/g, queryParameter);
    //console.log(finStr);
    return finStr;
}

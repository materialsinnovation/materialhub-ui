const baseURI = 'http://mmsd-lims-dev:8080/objects/';
const searchBaseURI =
    'http://mmsd-lims-dev:8080/objects/?query=/initial_str/sites/_/label:';
const queryParameter = '%20AND%20/initial_str/sites/_/label:';

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
    // focus on retrieving info by name
    // change id to number and name to name of element
    // var thingy = ev.target.name;
    // var dummyvalue = document.getElementById('dump');
    // var olddummy = dummyvalue.value;

    // if (olddummy.indexOf(thingy) != -1) {
    //     dummyvalue.value = olddummy.replace(thingy, '');
    // } else {
    //     dummyvalue.value = olddummy + thingy + '';
    // }

    // return dummyvalue;
}

async function search() {
    var formulabox = document.getElementById('FormulaBox').value;
    //console.log(formulabox);
    var str = formulabox;
    var shortenedStr = str.substring(0, str.length - 1);
    //console.log(shortenedStr);
    var replacedStr = shortenedStr.replace(/-/g, queryParameter);
    console.log(replacedStr);
}

// document.getElementById('Search').addEventListener('click', function () {
//     var formulabox = document.getElementById('FormulaxBox').value;
//     var str = formulabox;
//     var shortenedStr = str.substring(0, str.length - 1);
//     var replacedStr = shortenedStr.replace(/-/g, queryParameter);
//     this.searchstring = replacedStr;
//     console.log(this.searchstring);
// });

function myTrim(x) {
    var str = x.replace(/^\s+|\s+$/gm, '');
    var dummy = str + '-';
    return dummy;
}

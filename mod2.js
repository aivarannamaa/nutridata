var accessToken = JSON.parse(localStorage.getItem("tokenInfo"))["access_token"]

function presentSummary(menu, components) {
    console.log("Got both");
    console.log(menu);
    console.log(components);
}

function error(s) {
    console.error(s);
    return null;
}

function getDateTitle() {
    var className = "tai-diary-tab-header";
    var elts = document.getElementsByClassName(className);
    if (elts.length != 1) {
        throw "Found several '" + className + "'-s";
    }
    var text = elts[0].textContent;
    var matches = text.match(/^.+\d{4}/);
    if (matches.length != 1) {
        throw "Can't find date str";
    }
    return matches[0].trim();
}

function getSelectedDate() {
    var title = getDateTitle();
    var matches = title.match(/\d{2}\.\d{2}\.\d{4}/);
    if (matches.length != 1) {
        throw "Can't extract date from '" + title + "'";
    }
    return matches[0];
}

function processMenu(menu) {
    console.log("OOOOOOOOOO");
    console.log(menu);
    var componentIds = [];
    menu["meals"].forEach(function (meal) {
        console.log(meal["nameEst"]);
        meal["recipes"].forEach(function (recipe) {
            if (!componentIds.includes(recipe["recipeId"])) {
                componentIds.push(recipe["recipeId"]);
            }
        });
    });
    console.log(componentIds);
    var componentsUrl = "https://tap.nutridata.ee/api-foods/recipes/less/version"
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                presentSummary(menu, JSON.parse(this.responseText));
            } else {
                console.error("Response " + this.status 
                    + " from requesting " + componentsUrl
                    + "\nResponse body: " + this.responseText);
            }
        }
    };
    xhr.open('PUT', componentsUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send(JSON.stringify(componentIds));
}

function startProcessing() {
    var menuUrl = "https://tap.nutridata.ee/api-tap/analysis/date/2019-05-10"
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                processMenu(JSON.parse(this.responseText));
            } else {
                console.error("Response " + this.status 
                    + " from requesting " + menuUrl
                    + "\nResponse body: " + this.responseText);
            }
        }
    };
    xhr.open('GET', menuUrl, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send();
}

startProcessing()

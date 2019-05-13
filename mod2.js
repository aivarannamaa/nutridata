var accessToken = JSON.parse(localStorage.getItem("tokenInfo"))["access_token"]

function presentSummary(menu) {
    console.log("Got both");
    console.log(menu);
}

function addrecipesToMenu(recipes, menu) {
    var map = new Map();
    recipes.forEach(function (comp) {
        map.set(comp["recipeId"], comp);
    });

    menu["meals"].forEach(function (meal) {
        meal["recipes"].forEach(function (rsp) {
            rsp["nutridata"] = map.get(rsp["recipeId"]);
        });
    });
    
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

function getSelectedDateIso() {
    var title = getDateTitle();
    var matches = title.match(/\d{2}\.\d{2}\.\d{4}/);
    if (matches.length != 1) {
        throw "Can't extract date from '" + title + "'";
    }
    var parts = matches[0].split(".");
    return parts[2] + "-" + parts[1] + "-" + parts[0];
}

function processMenu(menu) {
    var recipeIds = [];
    menu["meals"].forEach(function (meal) {
        console.log(meal["nameEst"]);
        meal["recipes"].forEach(function (recipe) {
            if (!recipeIds.includes(recipe["recipeId"])) {
                recipeIds.push(recipe["recipeId"]);
            }
        });
    });
    console.log(recipeIds);
    var recipesUrl = "https://tap.nutridata.ee/api-foods/recipes/less/version"
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var recipes = JSON.parse(this.responseText);
                addrecipesToMenu(recipes, menu);
                presentSummary(menu);
            } else {
                console.error("Response " + this.status 
                    + " from requesting " + recipesUrl
                    + "\nResponse body: " + this.responseText);
            }
        }
    };
    xhr.open('PUT', recipesUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send(JSON.stringify(recipeIds));
}

function startProcessing() {
    var isoDate = getSelectedDateIso();
    console.log("Date: " + isoDate);
    var menuUrl = "https://tap.nutridata.ee/api-tap/analysis/date/" + isoDate;
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

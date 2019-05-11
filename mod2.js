var accessToken = JSON.parse(localStorage.getItem("tokenInfo"))["access_token"]

function presentSummary(menu, components) {
    console.log(menu);
    console.log(components);
}

function processMenu(menu) {
    console.log(menu);
    var componentIds = [];
    menu["meals"].forEach(function (meal) {
        meal["recipes"].forEach(function (recipe) {
            if (!componentIds.includes(recipe["recipeId"])) {
                componentIds.push(recipe["recipeId"]);
            }
        });
    });
    console.log(componentIds);
    return;
    var componentsUrl = "https://tap.nutridata.ee/api-foods/recipes/less/version"
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
    xhr.open('PUT', menuUrl, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send();
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

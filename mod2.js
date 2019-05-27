
var componentNamesAndIds = [
    ["protein", 2],
    ["fat", 3],
    ["total_carbs", 4],
    ["kcal", 39],
];

function addSummaryButton() {
    var btn = document.createElement("button");
    btn.innerHTML = "Arvuta kokkuvõte"; 
    btn.id = "ketoSummaryButton";
    btn.style="position:fixed; bottom:0px; right:0px; padding: 1em 2em";
    btn.addEventListener("click", startProcessing);
    document.body.appendChild(btn);  
}

function presentSummary(menu) {
    //console.log("Got both");
    //console.log(menu);
    table = createSummaryTable(menu);
    var summaryDiv = document.getElementById("ketoSummaryDiv");
    if (!summaryDiv) {
        console.log("crreating");
        summaryDiv = document.createElement("div");
        summaryDiv.id = "ketoSummaryDiv";
        summaryDiv.style = "position:fixed; bottom:0px; left:0px; padding: 0.5em; background: #f0f0f0; z-index: 1000 ! important";
        document.body.appendChild(summaryDiv);  
    } else {
        console.log("present");
    }
    summaryDiv.innerHTML = createSummaryTable(menu);
    //console.log(table); 
}

function createSummaryTable(menu) {
    var s = "<table id='ketoSummaryTable' cellspacing='0'>\n";
    var totalKcal = 0;
    var totalCarb = 0;
    var totalFat = 0;
    var totalProt = 0;
    var dateStr = (menu.date[2].toString().padStart(2,'0') 
        + '.' + menu.date[1].toString().padStart(2,'0') 
        //+ '.' + menu.date[0].toString()
        );
        
    //s += "<tr><th colspan='6'>"+dateStr+"</th></tr>\n";
    s += "<tr><th>"+dateStr+"</th><th>Rats</th><th>Kcal</th><th>Süsi</th><th>Rasv</th><th>Valk</th></tr>\n";
    
    menu.meals.forEach(function (meal) {
        var kcal = 0;
        var carb = 0;
        var fat = 0;
        var prot = 0;
        
        var name = meal["nameEst"]
            .replace("Hommikusöök", "Hommik")
            .replace("Lõunasöök", "Lõuna")
            .replace("Õhtuoode", "Oode")
            .replace("Õhtusöök", "Õhtu")
            .replace("Ööoode", "Öö");
        
        meal.recipes.forEach(function (recipe) {
            kcal += (recipe["amount"] / 100) * recipe["nutridata"]["kcal"];
            carb += (recipe["amount"] / 100) * recipe["nutridata"]["total_carbs"];
            fat += (recipe["amount"] / 100) * recipe["nutridata"]["fat"];
            prot += (recipe["amount"] / 100) * recipe["nutridata"]["protein"];
        });
        
        if (meal["nameEst"] == "Lõunaoode" 
            &&  kcal == 0 && carb == 0 && fat == 0 && prot == 0) {
            return;
        }
        
        
        var ratio = fat / (carb + prot);
        
        s += "<tr>"
            + "<td>" + name + "</td>"
            + "<td class='data strong'>" + ratio.toFixed(2) + "</td>"
            + "<td class='data strong'>" + kcal.toFixed(0) + "</td>"
            + "<td class='data'>" + carb.toFixed(2) + "</td>"
            + "<td class='data'>" + fat.toFixed(1) + "</td>"
            + "<td class='data'>" + prot.toFixed(1) + "</td>"
            + "</tr>\n";
            
        totalKcal += kcal;
        totalCarb += carb;
        totalFat += fat;
        totalProt += prot;
    });
    
    var totalRatio = totalFat / (totalCarb + totalProt);
    s += "<tr>"
        + "<td class='summary'>Kokku</td>"
        + "<td class='data summary'>" + totalRatio.toFixed(2) + "</td>"
        + "<td class='data summary'>" + totalKcal.toFixed(0) + "</td>"
        + "<td class='data summary'>" + totalCarb.toFixed(2) + "</td>"
        + "<td class='data summary'>" + totalFat.toFixed(1) + "</td>"
        + "<td class='data summary'>" + totalProt.toFixed(1) + "</td>"
        + "</tr>\n";
            
    s += "</table>\n";
    return s;
}

function addRecipesToMenu(recipes, menu) {
    var map = new Map();
    recipes.forEach(function (receipe) {
        map.set(receipe["recipeId"], receipe);
        receipe.components.forEach(function (component) {
            componentNamesAndIds.forEach(function (nid) {
                if (component["componentId"] == nid[1]) {
                    if (component.hasOwnProperty(nid[0])) {
                        throw "Duplicate entry for component " + nid[1];
                    }
                    receipe[nid[0]] = component["amount"];
                }
            });
        });
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
        meal["recipes"].forEach(function (recipe) {
            if (!recipeIds.includes(recipe["recipeId"])) {
                recipeIds.push(recipe["recipeId"]);
            }
        });
    });
    
    var recipesUrl = "https://tap.nutridata.ee/api-foods/recipes/less/version"
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var recipes = JSON.parse(this.responseText);
                addRecipesToMenu(recipes, menu);
                presentSummary(menu);
            } else {
                console.error("Response " + this.status 
                    + " from requesting " + recipesUrl
                    + "\nResponse body: " + this.responseText);
            }
        }
    };
    var accessToken = JSON.parse(localStorage.getItem("tokenInfo"))["access_token"];
    xhr.open('PUT', recipesUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send(JSON.stringify(recipeIds));
}

function startProcessing() {
    var isoDate = getSelectedDateIso();
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
    var accessToken = JSON.parse(localStorage.getItem("tokenInfo"))["access_token"];
    xhr.open('GET', menuUrl, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send();
}

function addStyles() {
    var style = document.createElement('style');
    style.innerHTML = ''
        + '#ketoSummaryTable td, #ketoSummaryTable th {' 
        +     'font-size: small ! important;' 
        +     'padding-top: 0px ! important;' 
        +     'padding-bottom: 0px ! important;' 
        +     'padding-right: 0px ! important;' 
        + '}\n'
        + '#ketoSummaryTable {' 
        +     'border-spacing: 0px;' 
        +     'border-collapse: collapse;' 
        + '}\n'
        + '#ketoSummaryTable td.data {' 
        +     'text-align: right;' 
        +     'padding-left: 6px;' 
        + '}\n'
        + '#ketoSummaryTable td.strong {' 
        +     'font-weight: bold;' 
        + '}\n'
        + '#ketoSummaryTable td.summary {' 
        +     'font-weight: bold;' 
        + '}\n'
        ;

    // Get the first script tag
    var ref = document.querySelector('script');

    // Insert our new styles before the first script tag
    ref.parentNode.insertBefore(style, ref);
}

addStyles();
addSummaryButton();

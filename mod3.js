
var componentNamesAndIds = [
    ["protein", 2],
    ["fat", 3],
    ["sat_fat", 10],
    ["total_carbs", 4],
    ["net_carbs", 42],
    ["sugar", 85],
    ["kcal", 39],
];

function closeDiv() {
	var div = document.getElementById("ketoSummaryDiv");
	if (div) {
		div.parentNode.removeChild(div);
	}
}

function getSummaryButton() {
    return document.getElementById("ketoSummaryButton");
}

function resetSummaryButton() {
    getSummaryButton().innerHTML = "Arvuta kokkuvõte"; 
}

function addSummaryButton() {
    var btn = getSummaryButton();
    if (btn) {
        return;
    }
    btn = document.createElement("button");
    btn.id = "ketoSummaryButton";
    btn.style="position:fixed; bottom:0px; right:0px; padding: 1em 2em";
    btn.addEventListener("click", startProcessing);
    document.body.appendChild(btn);  
    resetSummaryButton();
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
        summaryDiv.style = "position:fixed; bottom:0px; left:0px; padding: 0.5em; background: #f0f0f0; z-index: 1049 ! important";
        document.body.appendChild(summaryDiv);  
    } else {
        console.log("present");
    }
    summaryDiv.innerHTML = createSummaryTable(menu) 
    	+ "<div style='float:right; font-style:italic; cursor:pointer; font-size:small' onclick='closeDiv()'>SULGE</div>";
    resetSummaryButton();
    //console.log(table); 
}

function createSummaryTable(menu) {
    var s = "<table id='ketoSummaryTable' cellspacing='0'>\n";
    var totalKcal = 0;
    var totalCarb = 0;
    var totalNCarb = 0;
    var totalSugar = 0;
    var totalFat = 0;
    var totalSatFat = 0;
    var totalProt = 0;
    var dateStr = (menu.date[2].toString().padStart(2,'0') 
        + '.' + menu.date[1].toString().padStart(2,'0') 
        //+ '.' + menu.date[0].toString()
        );
        
    //s += "<tr><th colspan='6'>"+dateStr+"</th></tr>\n";
    s += "<tr><th class='strong'>"+dateStr+"</th><th class='data'>Rats</th><th class='data break_after strong'>Kcal</th><th class='data strong'>Süsi</th><th class='data break_after'>Suhk</th><th class='data strong'>Rasv</th><th class='data break_after'>Küll</th><th class='data strong'>Valk</th></tr>\n";
    
    menu.meals.forEach(function (meal) {
        var kcal = 0;
        var carb = 0;
        var nCarb = 0;
        var sugar = 0;
        var fat = 0;
        var satFat = 0;
        var prot = 0;
        
        var name = meal["nameEst"]
            .replace("Hommikusöök", "Hommik")
            .replace("Lõunaoode",   "L-oode")
            .replace("Lõunasöök",   "Lõuna")
            .replace("Õhtuoode",    "Õ-oode")
            .replace("Õhtusöök",    "Õhtu")
            .replace("Ööoode",      "Ööoode")
	;
        
        meal.recipes.forEach(function (recipe) {
            kcal += (recipe["amount"] / 100) * recipe["nutridata"]["kcal"];
            carb += (recipe["amount"] / 100) * recipe["nutridata"]["total_carbs"];
            nCarb += (recipe["amount"] / 100) * recipe["nutridata"]["net_carbs"];
            sugar += (recipe["amount"] / 100) * recipe["nutridata"]["sugar"];
            fat += (recipe["amount"] / 100) * recipe["nutridata"]["fat"];
            satFat += (recipe["amount"] / 100) * recipe["nutridata"]["sat_fat"];
            prot += (recipe["amount"] / 100) * recipe["nutridata"]["protein"];
        });
        
        if (kcal == 0 && carb == 0 && nCarb == 0 && fat == 0 && prot == 0) {
            return;
        }
        
        
        var ratio = fat / (carb + prot);
        var nRatio = fat / (nCarb + prot);
        
        var rowClass = "";

        s += "<tr class='"+rowClass+"'>"
            + "<td>" + name + "</td>"
            //+ "<td class='data strong'>" + ratio.toFixed(2) + "</td>"
            + "<td class='data'>" + nRatio.toFixed(1) + "</td>"
            + "<td class='data strong break_after'>" + kcal.toFixed(0) + "</td>"
            //+ "<td class='data'>" + carb.toFixed(2) + "</td>"
            + "<td class='data strong'>" + nCarb.toFixed(0) + "</td>"
            + "<td class='data break_after'>" + sugar.toFixed(0) + "</td>"
            + "<td class='data strong'>" + fat.toFixed(0) + "</td>"
            + "<td class='data break_after'>" + satFat.toFixed(0) + "</td>"
            + "<td class='data strong'>" + prot.toFixed(0) + "</td>"
            + "</tr>\n";
            
        totalKcal += kcal;
        totalCarb += carb;
        totalNCarb += nCarb;
        totalSugar += sugar;
        totalFat += fat;
        totalSatFat += satFat;
        totalProt += prot;
    });
    
    var totalRatio = totalFat / (totalCarb + totalProt);
    var totalNRatio = totalFat / (totalNCarb + totalProt);
    s += "<tr class='break_before'>"
        + "<td class='summary'>Kokku</td>"
        //+ "<td class='data summary'>" + totalRatio.toFixed(2) + "</td>"
        + "<td class='data summary'>" + totalNRatio.toFixed(1) + "</td>"
        + "<td class='data summary break_after strong'>" + totalKcal.toFixed(0) + "</td>"
        //+ "<td class='data summary'>" + totalCarb.toFixed(2) + "</td>"
        + "<td class='data summary strong'>" + totalNCarb.toFixed(0) +  "</td>"
        + "<td class='data summary break_after'>" + totalSugar.toFixed(0) +  "</td>"
        + "<td class='data summary strong'>" + totalFat.toFixed(0) + "</td>"
        + "<td class='data summary break_after'>" + totalSatFat.toFixed(0) + "</td>"
        + "<td class='data summary strong'>" + totalProt.toFixed(0) + "</td>"
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
    var className = "date-user-badge";
    var elts = document.getElementsByClassName(className);
    if (elts.length != 1) {
        //throw "Found several '" + className + "'-s";
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
                alert("Ei saanud toitainete andmeid kätte");
                resetSummaryButton();
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
    getSummaryButton().innerHTML = "Palun oota ......";
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
                alert("Ei saanud menüü andmeid kätte");
                resetSummaryButton();
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
        + '#ketoSummaryTable tr.break_after td, #ketoSummaryTable th {' 
        +     'border-bottom: 1px solid gray;' 
        + '}\n'
        + '#ketoSummaryTable tr.break_before td {' 
        +     'border-top: 1px solid gray;' 
        + '}\n'
        + '#ketoSummaryTable td.break_after, #ketoSummaryTable th.break_after {'
        +     'border-right: 1px solid gray;' 
        +     'padding-right: 0.5em ! important;' 
        + '}\n'
        + '#ketoSummaryTable {' 
        +     'border-spacing: 0px;' 
        +     'border-collapse: collapse;' 
        +     'margin-bottom: 0em;' 
        +     'font-size: small ! important;' 
        + '}\n'
        + '#ketoSummaryTable td.data, #ketoSummaryTable th.data {' 
        +     'text-align: right;' 
        +     'padding-left: 0.5em;' 
        + '}\n'
        + '#ketoSummaryTable th {' 
        +     'font-weight: normal;' 
        + '}\n'
        + '#ketoSummaryTable td.strong, #ketoSummaryTable th.strong {' 
        +     'font-weight: bold;' 
        + '}\n'
        + '#ketoSummaryTable td.summary {' 
        +     'font-style: italic;' 
        ;

    // Get the first script tag
    var ref = document.querySelector('script');

    // Insert our new styles before the first script tag
    ref.parentNode.insertBefore(style, ref);
}

addStyles();
addSummaryButton();

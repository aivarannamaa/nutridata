console.log("before add");
window.addEventListener("load", function(event) {
console.log("in listener");
//////////////////////////////////////////////////////////////////////
var calcBtn = document.getElementById("calcDay");

if (calcBtn && !calcBtn.ratsitud) {
    calcBtn.ratsitud = true;
    
    uusBtn = calcBtn.parentNode;
    uusBtn.style="position:fixed; bottom:0px; right:0px; background: white ! important";
    document.body.appendChild(uusBtn);
    
    var ifr = document.createElement("iframe");
    ifr.name = "sorts53";
    ifr.style.cssText = 'position:fixed;width:20em;height:10em;background:#eeeeee;top:0px;left:0px;z-index:10000';
    ifr.style.cssText = 'display:none';
    document.body.appendChild(ifr);
    ifr.onload = function () { 
        if (!ifr.contentWindow.location.href.includes("53")) {
            console.log("ret " + ifr.contentWindow.location.href);
            return;
        }
        console.log("ONLOAD " + ifr.contentWindow.location.href);
        var box = document.getElementById("dabox");
        if (!box) {
            var box = document.createElement('div');
            box.id = "dabox";
            box.style.cssText = 'position:fixed;width:30em;height:17em;background:#ffffff ! important;box-shadow: 3px -3px 5px 3px #dddddd;padding: 1em;bottom:0px;left:0px;z-index:10000';
            document.body.appendChild(box);
        }

        idoc = ifr.contentWindow.document;
        var src = idoc.getElementsByClassName("tulemused")[0];
        console.log("SRC, " + src);
        var table = document.createElement("table");
        var h2 = document.createElement("h2");
        table.innerHTML = src.innerHTML;
        console.log("REV");
        console.log(src.previousElementSibling);
        h2.innerHTML = src.previousElementSibling.innerHTML;
        box.innerHTML = "";
        box.appendChild(h2);
        box.appendChild(table);
        console.log("rows, " + table.rows);
    };

    var frm = document.getElementById("dayForm");
    frm.setAttribute("target", "sorts53");
    
}

//////////////////////////////////////////////////////////////////////
var tbl = document.getElementsByClassName("tulemused")[0];
console.log(tbl);

if (tbl && window.location.href.includes("53") && !tbl.ratsitud) {
    tbl.ratsitud = true;
    for (i = 0; i < tbl.rows.length; i++) {
        var row = tbl.rows[i];
        var cell = row.insertCell(2);
        
        if (i == 0) {
            cell.outerHTML = "<th>Ratsioon</th>";
            console.log(row.cells[1].innerHTML);
            console.log(row.cells[3].innerHTML);
            console.log(row.cells[4].innerHTML);
            row.cells[1].innerHTML = row.cells[1].innerHTML.replace("Energia (sh kiudained),", "En.");
            row.cells[3].innerHTML = row.cells[3].innerHTML.replace("Süsivesikud, kokku,", "Süsi");
            row.cells[4].innerHTML = row.cells[4].innerHTML.replace("Rasvad,", "Rasv");
            row.cells[5].innerHTML = row.cells[5].innerHTML.replace("Valgud,", "Valk");
        } else if (i == tbl.rows.length-1) {
            cell.innerHTML = "-";
        } else {
            var sysi = parseFloat(row.cells[3].innerHTML);
            var rasv = parseFloat(row.cells[4].innerHTML);
            var valk = parseFloat(row.cells[5].innerHTML);
            console.log(sysi + "/" + rasv + "/" + valk);
            
            if (isNaN(sysi) || isNaN(rasv) || isNaN(valk)) {
                cell.innerHTML = "-";
            } else  {
                var rats = rasv / (sysi + valk)
                cell.innerHTML = rats.toFixed(2);
                cell.style = "font-weight: bold; font-style: italic";
            }
            
            if (i % 2 == 1) {
                if (i == 7) {
                    row.style = "background-color: #eeeeee; font-weight: bold";
                } else {
                    row.style = "background-color: #eeeeee";
                }
            } 
        }
    }
}

//////////////////////////////////////////////////////////////////////
});

console.log("after add");

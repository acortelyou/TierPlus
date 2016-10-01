// ==UserScript==
// @namespace    https://github.com/acortelyou/userscripts
// @name         TierPlus
// @version      0.6
// @author       Alex Cortelyou
// @description  Tier injector for Yahoo FF
// @thanks       to Boris Chen for publishing his FF tier data
// @license      MIT License
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @match        http://football.fantasysports.yahoo.com/f1/*
// @match        https://football.fantasysports.yahoo.com/f1/*
// @require      https://code.jquery.com/jquery-latest.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/0.71/jquery.csv-0.71.min.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADyMAAA8jASjgIYkAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTCtCgrAAAAEK0lEQVR4Xu2bTchUVRyHx8g+jDKKCsnaWNYiqIwIosxcVBCRSWQQuVGCFu1qURYtok2UH8uyTEIXuahACSotgrBNH/aJRIkurMQyUhMt+3ieeefEee/MO+894x3fMzP3Bw/vnDPn3nvu784953/+976NWrVq1apVvc6Cm2FhRSyA82EgdDn8CP9WzCGYD1lrGnwAnU6gCr6HMyBbPQCdOl4lT0KWmgk/QejodzAbTjtBzoWtEPb7B1wK2WkNhE7K7VCVLoOjEPa9CbLSNXAcQgffgKr1LIT9i7NDNnof4s59DG9VzLsQH+MzyEKnwz8Qd+5kkcWMYNATd+oVeLpPuO/4WB57ylU0wAiwX3Lf8bFqA2DKVRsAcadSDLgOnoGyJzJUBsyBX8Bt7reihIbGAMPmbyFssxTKaCgMOBXegXibXg3YCd+0+LrFV/Blix2wDvqaS0g1YBnY7hj81vrcqwFl+QTOgb4o1YB58AV40v51m34bIOYp+hI59jIGBKUacAvY3oXXkklwYI2X0eKawluwUp1MA8wN2v7PZmlyecWLC7X1YOaqMuVsgPLedwyI+7gSKlPuBqgLwBkj7ucKmFBXwhZwSpkMp6B4x2UMMM11K/wAbvMcmOCYDt0UDPgL7kjkIXDmifv6GLTJn8xuiBumUMaAj6DTtmZ9uikMglVxANpk4NCpcVnKGPAC+OzAJOrPrb+afg9004VgcGP7XvGk4/6O010Qf/kp+DN5tAQhJ+hVylneDvE5/i/DRR0KX+wDB4+ycmByO+/TnDWhAa9D/MViSNFAG2DUFFduhFQNrAGzIKzLxcHpPEhVDgZ4LjfARc1SZ7UZ4FOWuMJR9tUe+BvcfioM8IIZ54f0vH15GXy0VlSbAfEjpypIiQSr0mYIx4+DneehqDYD4sKbsPoEMHc/WTRXtfzZhyt/N7jQceq2/CsU1dUAvxw0mV+w7wchrPJ8kcI6Y5NTrIg0dAZ4gk/Bfc1SozEDwupvmxUFJRugq67WzOM5QG6AqyBHnQnhIeoRuBaKSjbAuD1uI4fhashJZ0N4PcfVouNBJyUZ4JsYYXp7EZaD2VbLOb2kYObnQ7BfzmqLYCIlGeDqzPq9zdKYHgTrTEHnopfAPvn6jHmGbkoy4ApwubqqWRrbuTk12263IgM5DYZfqbfmrojPwXOIlWRArBshbvs45CBPsNsLGvdCrGQD5oJ5P5fG3mchclwLueh68HYtYpqtmAFOMuAm0N23m6UxPQy2zWkMSFGSAbeB9UZZF4NBx2utuvdgEJVkgIGFM4DfGVjsb30Wn74MopIMUN5feyC0cQx4AgZVyQYoX4VzCrwTUvKEOaonA4ZJXQ0wLe7VHmaKqf9xhVGk8XuhYpTwv1Aaj0CIpUcNEylNXQKO8uGflEYBQ/xatWrVGmU1Gv8BCh6/OsyOdA0AAAAASUVORK5CYII=
// ==/UserScript==

//todo: link tags to tier popup image
//todo: visualize stddev in tag

var now = Math.floor(Date.now() / 1000);
var lastUpdate = GM_getValue("lastUpdate", 0);
var old = now - lastUpdate > 10800;
if (old) GM_setValue("lastUpdate", now);

var base = "https://s3-us-west-1.amazonaws.com/fftiers/out/current/";
var feeds = {
    "K":    "weekly-K.csv",
    "QB":   "weekly-QB.csv",
    "RB":   "weekly-HALF-POINT-PPR-RB.csv",
    "WR":   "weekly-HALF-POINT-PPR-WR.csv",
    "TE":   "weekly-HALF-POINT-PPR-TE.csv",
    "F":    "weekly-HALF-POINT-PPR-FLEX.csv",
    "DEF":  "weekly-DST.csv"
};

var data = [];
$.each(feeds,function(pos,feed) {
    var input = GM_getValue(pos, "");
    if (input === "" || old) {
        GM_xmlhttpRequest({
          method: "GET",
          url: base + feed,
          synchronous: true,
          onload: function(response) {
            GM_setValue(pos, input = response.responseText);
          }
        });
    }
    if (input) data[pos] = $.csv.toObjects(input);
});
console.log(data);

var teammap = {};
var input = GM_getValue("teammap", "");
if (input) teammap = JSON.parse(input);

var inject = function() {
$("td.player").each(function() {

    var i;

    var name = $(this).find(".ysf-player-name a").text();
    var teamspan = $(this).find(".ysf-player-name span");
    var teamtype = $(teamspan).text().split(" - ");
    var team = teamtype.shift();
    var type = teamtype.shift();

    if (!type || !name) return;

    var pattern = name
        .replace(/\./g, "\\.")
        .replace(/^(\w)\\\. /, "$1[\\w\\.']+ ")
        .replace(/ ([JS])r\\\.$/,"( $1r\\.)?");
    var re = new RegExp(pattern);

    var types = [].concat(type.split(','));
    for (i in types) {
        if ($.inArray(types[i], ["WR", "RB", "TE"]) !== -1) {
            types.unshift("F");
            break;
        }
    }

    var tags = [];
    for (i in types) {
        var feed = types[i];
        var tier = feed != 'F' ? feed : '';
        if (feed in data)
        for (i = 0; i < data[feed].length; i++) {
            var row = data[feed][i];
            if (re.test(row["Player.Name"]) && (!(row.Team in teammap) || teammap[row.Team] == team)) {
                tier = feed+row.Tier;
                if (!/^\w\. /.test(name) && !(row.Team in teammap)) {
                    teammap[row.Team] = team;
                }
                break;
            }
        }
        if (tier) tags.push(tier);
    }
    var tag = tags.join(' ');

    $(teamspan).text(team+' ');
    $(teamspan).after('<span class="Fz-xxs" style="float:right;margin-right:3pt;">'+tag+'</span>');
    $(teamspan).after($(this).find('span.ysf-player-video-link').detach());

});

GM_setValue("teammap", JSON.stringify(teammap));
};

var observer = new MutationObserver(function(mutations, observer) {
    observer.disconnect();
    inject();
    observe();
});
var observe = function(){
    var node = document.querySelector('table.Table');
    for (var i = 0; i < 4; i++) node = node.parentNode;
    observer.observe(node,{childList: true, characterData: false, attributes: false, subtree:true});
};
inject();
observe();

// ==UserScript==
// @namespace    https://github.com/acortelyou/userscripts
// @name         TierPlus
// @version      0.1
// @author       Alex Cortelyou
// @description  Tier injector for Yahoo FF
// @thanks       to Boris Chen for publishing his FF tier data
// @license      MIT License
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @match        https://football.fantasysports.yahoo.com/f1/*
// @require      https://code.jquery.com/jquery-latest.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/0.71/jquery.csv-0.71.min.js
// @run-at       document-idle
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
    "FLEX": "weekly-HALF-POINT-PPR-FLEX.csv",
    "DEF":  "weekly-DST.csv"
};

var data = [];
$.each(feeds,function(pos,file) {
    var input = GM_getValue(pos, "");
    if (input === "" || old) {
        GM_xmlhttpRequest({
          method: "GET",
          url: base + file,
          synchronous: true,
          onload: function(response) {
            GM_setValue(pos, input = response.responseText);
          }
        });
    }
    data[pos] = $.csv.toObjects(input);
});
console.log(data);

$("td.player").each(function() {

    var name = $(this).find(".ysf-player-name a").text();
    var teamspan = $(this).find(".ysf-player-name span");
    var teamtype = $(teamspan).text().split(" - ");
    var team = teamtype.shift();
    var type = teamtype.shift();

    if (type == null) return;

    var pattern = name
        .replace(/\./g, "\\.")
        .replace(/^(\w)\\\. /, "$1[\\w\\.']+ ")
        .replace(/ ([JS])r\\\.$/,"( $1r\\.)?");
    var re = new RegExp(pattern);

    var sources = [ type ];
    if ($.inArray(type, ["WR", "RB", "TE"]) !== -1) sources.unshift("FLEX");

    var tags = [];
    for (var source in sources) {
        source = sources[source];
        for (var i = 0; i < data[source].length; i++) {
            if (re.test(data[source][i]["Player.Name"])) {
                tags.push(source+data[source][i].Tier);
                break;
            }
        }
    }
    if (tags.length === 0) tags.push(type);
    var tag = tags.join(' ');

    $(teamspan).text(team+' ');
    $(teamspan).after('<span class="Fz-xxs" style="float:right;margin-right:3pt;">'+tag+'</span>');
    $(teamspan).after($(this).find('span.ysf-player-video-link').detach());

});

// ==UserScript==
// @namespace    https://github.com/acortelyou/userscripts
// @name         TierPlus
// @version      0.9
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
// @require      https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.8.2/js/lightbox.min.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADyMAAA8jASjgIYkAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTCtCgrAAAAEK0lEQVR4Xu2bTchUVRyHx8g+jDKKCsnaWNYiqIwIosxcVBCRSWQQuVGCFu1qURYtok2UH8uyTEIXuahACSotgrBNH/aJRIkurMQyUhMt+3ieeefEee/MO+894x3fMzP3Bw/vnDPn3nvu784953/+976NWrVq1apVvc6Cm2FhRSyA82EgdDn8CP9WzCGYD1lrGnwAnU6gCr6HMyBbPQCdOl4lT0KWmgk/QejodzAbTjtBzoWtEPb7B1wK2WkNhE7K7VCVLoOjEPa9CbLSNXAcQgffgKr1LIT9i7NDNnof4s59DG9VzLsQH+MzyEKnwz8Qd+5kkcWMYNATd+oVeLpPuO/4WB57ylU0wAiwX3Lf8bFqA2DKVRsAcadSDLgOnoGyJzJUBsyBX8Bt7reihIbGAMPmbyFssxTKaCgMOBXegXibXg3YCd+0+LrFV/Blix2wDvqaS0g1YBnY7hj81vrcqwFl+QTOgb4o1YB58AV40v51m34bIOYp+hI59jIGBKUacAvY3oXXkklwYI2X0eKawluwUp1MA8wN2v7PZmlyecWLC7X1YOaqMuVsgPLedwyI+7gSKlPuBqgLwBkj7ucKmFBXwhZwSpkMp6B4x2UMMM11K/wAbvMcmOCYDt0UDPgL7kjkIXDmifv6GLTJn8xuiBumUMaAj6DTtmZ9uikMglVxANpk4NCpcVnKGPAC+OzAJOrPrb+afg9004VgcGP7XvGk4/6O010Qf/kp+DN5tAQhJ+hVylneDvE5/i/DRR0KX+wDB4+ycmByO+/TnDWhAa9D/MViSNFAG2DUFFduhFQNrAGzIKzLxcHpPEhVDgZ4LjfARc1SZ7UZ4FOWuMJR9tUe+BvcfioM8IIZ54f0vH15GXy0VlSbAfEjpypIiQSr0mYIx4+DneehqDYD4sKbsPoEMHc/WTRXtfzZhyt/N7jQceq2/CsU1dUAvxw0mV+w7wchrPJ8kcI6Y5NTrIg0dAZ4gk/Bfc1SozEDwupvmxUFJRugq67WzOM5QG6AqyBHnQnhIeoRuBaKSjbAuD1uI4fhashJZ0N4PcfVouNBJyUZ4JsYYXp7EZaD2VbLOb2kYObnQ7BfzmqLYCIlGeDqzPq9zdKYHgTrTEHnopfAPvn6jHmGbkoy4ApwubqqWRrbuTk12263IgM5DYZfqbfmrojPwXOIlWRArBshbvs45CBPsNsLGvdCrGQD5oJ5P5fG3mchclwLueh68HYtYpqtmAFOMuAm0N23m6UxPQy2zWkMSFGSAbeB9UZZF4NBx2utuvdgEJVkgIGFM4DfGVjsb30Wn74MopIMUN5feyC0cQx4AgZVyQYoX4VzCrwTUvKEOaonA4ZJXQ0wLe7VHmaKqf9xhVGk8XuhYpTwv1Aaj0CIpUcNEylNXQKO8uGflEYBQ/xatWrVGmU1Gv8BCh6/OsyOdA0AAAAASUVORK5CYII=
// ==/UserScript==

$('<link href="//cdnjs.cloudflare.com/ajax/libs/lightbox2/2.8.2/css/lightbox.min.css" rel="stylesheet" type="text/css" />' +
  '<style type="text/css">' +
          'a.tierplus:link{color: #000;}' +
          '.lightboxOverlay{z-index:20000; position: fixed!important; top: 0; left: 0; height: 100%!important; width: 100%!important;}' +
          '.lightbox{z-index: 20001; position: fixed!important; top: 50%!important; transform: translateY(-50%);}' +
          '.lb-container{padding: 0;}' +
  '</style>'
).appendTo('head');

lightbox.option({
    maxWidth: 900,
    wrapAround: true,
    resizeDuration: 0,
    alwaysShowNavOnTouchDevices: true,
    albumLabel: "Chart %1 of %2",
});

var url = 'https://s3-us-west-1.amazonaws.com/fftiers/out/current/';
var now = new Date();
var ttl = 3600;

var data;

$(function() {
    try {
        data = JSON.parse(GM_getValue('data', ''));
        init();
    } catch (e) {
        data = {QB:{},WR:{},RB:{},TE:{},F:{},K:{},DEF:{}};
        init();
    }
});

var init = function() {

    data.QB.file  = 'weekly-QB';
    data.WR.file  = 'weekly-HALF-POINT-PPR-WR';
    data.RB.file  = 'weekly-HALF-POINT-PPR-RB';
    data.TE.file  = 'weekly-HALF-POINT-PPR-TE';
    data.F.file   = 'weekly-HALF-POINT-PPR-FLEX';
    data.K.file   = 'weekly-K';
    data.DEF.file = 'weekly-DST';

    data.WR.flex = true;
    data.RB.flex = true;
    data.TE.flex = true;

    for (var role in data) {
        data[role].pending = true;
    }
    for (role in data) {
        load(role);
    }
};

var load = function(role) {
    
    if (data[role].checked) {
        data[role].age = (now - new Date(data[role].checked)) / 1000;
    }
    
    if (data[role].age < ttl) {
        data[role].pending = false;
        ready();
        return;
    }
    
    var headers = {};
    if (data[role].modified) headers['If-Modified-Since'] = data.modified;

    GM_xmlhttpRequest({
        method: 'GET',
        url: url + data[role].file + '.csv',
        headers: headers,
        onerror: function(response) {
            data[role].pending = false;
            ready();
        },
        onload: function(response) {
            data[role].checked = response.responseHeaders.match(/Date: (.*)/)[1];
            data[role].status = response.status;
            data[role].text = response.responseText;

            if (response.status == 200) {
                data[role].modified = response.responseHeaders.match(/Last-Modified: (.*)/)[1];
                data[role].rows = $.csv.toObjects(response.responseText);
            }

            data[role].pending = false;
            ready();
        }
    });
};

var ready = function() {

    for (var role in data) {
        if (data[role].pending) return;
    }

    GM_setValue('data', JSON.stringify(data));
    console.log(data);

    scan();
    observe();
};

var scan = function() {
    console.log('scan');
    
    $('td.player').not('[tierplus]').each(inject);
};

var inject = function() {

    $(this).attr('tierplus', true);

    var a = $(this).find('div.ysf-player-name a');
    if (!a) return;

    var name = a.text();
    var name_pattern = name
        .replace(/\./g, "\\.")
        .replace(/^(\w)\\\. /, "$1[\\w\\.']+ ")
        .replace(/ ([JS])r\\\.$/,"( $1r\\.)?");
    var name_regex = new RegExp(name_pattern);

    var span = $(this).find('div.ysf-player-name span');
    if (!span) return;

    var text = $(span).text();
    if (!text) return;

    text = text.split(/[\s-]+/);
    if (text.length != 2) return;

    var team = text.shift();
    var team_pattern = team
        .replace(/JAX/i, 'JAC')
        .replace(/WSH/i, 'WAS');
    var team_regex = new RegExp(team_pattern,'i');

    var type = text.shift().toUpperCase();
    var types = [].concat(type.split(','));
    for (var i in types) {
        if (data[types[i]].flex) {
            types.unshift('F');
            break;
        }
    }

    var tags = [];
    for (i in types) {
        var role = types[i];
        var match = null;
        if (role in data && data[role].rows)
        for (i = 0; i < data[role].rows.length; i++) {
            var row = data[role].rows[i];
            if (name_regex.test(row['Player.Name']) && team_regex.test(row['Team'])) {
                match = row;
                break;
            }
        }
        if (match) {
            var tier = role + match['Tier'];
            var group = name + ' - ' + team + ' - ' + type;
            var hover = 'Best: ' + match['Best.Rank'] + ', ' +
                        'Worst: ' + match['Worst.Rank'] + ', ' +
                        'Avg: ' + round(match['Avg.Rank'],3) + ', ' +
                        'StdDev: ' + round(match['Std.Dev'],3);
            var label = name + ' - ' + tier + ' (' + hover + ')';
            var img = url + data[role].file + '.png';
            tags.push('<a href="'+img+'" data-lightbox="'+group+'" data-title="'+label+'" class="tierplus" title="'+hover+'">'+tier+'</a>');
        } else if (role != 'F') {
            tags.push(role);
        }
    }
    var tag = tags.join(' ');

    $(span).html(team+' <span style="display:none;">- '+type+'</span>');
    $(span).parent().before('<span class="Fz-xxs Lh-xs" style="float:right;margin-right:3pt;">'+tag+'</span>');
    $(span).append($(this).find('span.ysf-player-video-link')).find('a.yfa-video-playlist').text('');
};

var observer = new MutationObserver(function(mutations, observer) {
    observer.disconnect();
    scan();
    observe();
});

var observe = function(){
    var node = document.querySelector('table.Table');
    for (var i = 0; i < 4; i++) node = node.parentNode;
    observer.observe(node,{childList: true, characterData: false, attributes: false, subtree:true});
};

var round = function(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
};

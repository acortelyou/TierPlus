// ==UserScript==
// @namespace    https://github.com/acortelyou/userscripts
// @name         TierPlus
// @version      1.0.7
// @author       Alex Cortelyou
// @description  Tier injector for Yahoo FF
// @thanks       to Boris Chen for publishing his FF tier code
// @license      MIT License
// @grant        GM_xmlhttpRequest
// @match        http://football.fantasysports.yahoo.com/f1/*
// @match        https://football.fantasysports.yahoo.com/f1/*
// @require      https://code.jquery.com/jquery-latest.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/0.71/jquery.csv-0.71.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.8.2/js/lightbox.min.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADyMAAA8jASjgIYkAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTCtCgrAAAAEK0lEQVR4Xu2bTchUVRyHx8g+jDKKCsnaWNYiqIwIosxcVBCRSWQQuVGCFu1qURYtok2UH8uyTEIXuahACSotgrBNH/aJRIkurMQyUhMt+3ieeefEee/MO+894x3fMzP3Bw/vnDPn3nvu784953/+976NWrVq1apVvc6Cm2FhRSyA82EgdDn8CP9WzCGYD1lrGnwAnU6gCr6HMyBbPQCdOl4lT0KWmgk/QejodzAbTjtBzoWtEPb7B1wK2WkNhE7K7VCVLoOjEPa9CbLSNXAcQgffgKr1LIT9i7NDNnof4s59DG9VzLsQH+MzyEKnwz8Qd+5kkcWMYNATd+oVeLpPuO/4WB57ylU0wAiwX3Lf8bFqA2DKVRsAcadSDLgOnoGyJzJUBsyBX8Bt7reihIbGAMPmbyFssxTKaCgMOBXegXibXg3YCd+0+LrFV/Blix2wDvqaS0g1YBnY7hj81vrcqwFl+QTOgb4o1YB58AV40v51m34bIOYp+hI59jIGBKUacAvY3oXXkklwYI2X0eKawluwUp1MA8wN2v7PZmlyecWLC7X1YOaqMuVsgPLedwyI+7gSKlPuBqgLwBkj7ucKmFBXwhZwSpkMp6B4x2UMMM11K/wAbvMcmOCYDt0UDPgL7kjkIXDmifv6GLTJn8xuiBumUMaAj6DTtmZ9uikMglVxANpk4NCpcVnKGPAC+OzAJOrPrb+afg9004VgcGP7XvGk4/6O010Qf/kp+DN5tAQhJ+hVylneDvE5/i/DRR0KX+wDB4+ycmByO+/TnDWhAa9D/MViSNFAG2DUFFduhFQNrAGzIKzLxcHpPEhVDgZ4LjfARc1SZ7UZ4FOWuMJR9tUe+BvcfioM8IIZ54f0vH15GXy0VlSbAfEjpypIiQSr0mYIx4+DneehqDYD4sKbsPoEMHc/WTRXtfzZhyt/N7jQceq2/CsU1dUAvxw0mV+w7wchrPJ8kcI6Y5NTrIg0dAZ4gk/Bfc1SozEDwupvmxUFJRugq67WzOM5QG6AqyBHnQnhIeoRuBaKSjbAuD1uI4fhashJZ0N4PcfVouNBJyUZ4JsYYXp7EZaD2VbLOb2kYObnQ7BfzmqLYCIlGeDqzPq9zdKYHgTrTEHnopfAPvn6jHmGbkoy4ApwubqqWRrbuTk12263IgM5DYZfqbfmrojPwXOIlWRArBshbvs45CBPsNsLGvdCrGQD5oJ5P5fG3mchclwLueh68HYtYpqtmAFOMuAm0N23m6UxPQy2zWkMSFGSAbeB9UZZF4NBx2utuvdgEJVkgIGFM4DfGVjsb30Wn74MopIMUN5feyC0cQx4AgZVyQYoX4VzCrwTUvKEOaonA4ZJXQ0wLe7VHmaKqf9xhVGk8XuhYpTwv1Aaj0CIpUcNEylNXQKO8uGflEYBQ/xatWrVGmU1Gv8BCh6/OsyOdA0AAAAASUVORK5CYII=
// ==/UserScript==

$('<link href="//cdnjs.cloudflare.com/ajax/libs/lightbox2/2.8.2/css/lightbox.min.css" rel="stylesheet" type="text/css" />' +
  '<style type="text/css">' +
    'a.tierplus{color: #333;}' +
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

var data = {
  debug: false,
  mod: 'HALF',
  root: 'https://tierplus.azureedge.net/out/',

  QB: { file: "QB"  },
  WR: { file: "WR",   mod: true,  flex: true },
  RB: { file: "RB",   mod: true,  flex: true },
  TE: { file: "TE",   mod: true,  flex: true },
  F:  { file: "FLX", mod: true },
  K:  { file: "K"   },
  DEF:{ file: "DST" },

  fix: {
    name: [
      [ /\./g , "\\." ],
      [ /^(\w)\\\. / , "$1[\\w\\.']+ " ],
      [ / ([JS])r\\\.$/ , "( $1r\\.)?" ],
      [ /Wil / , "Will? " ],
      [ /Rob / , "Rob(ert)? " ],
    ],
    team: [
      [ /JAX/ , 'JAC' ],
      [ /WSH/ , 'WAS' ],
    ],
    teamname: {
      "ARI": "Cardinals",
      "ATL": "Falcons",
      "BAL": "Ravens",
      "BUF": "Bills",
      "CAR": "Panthers",
      "CHI": "Bears",
      "CIN": "Bengals",
      "CLE": "Browns",
      "DAL": "Cowboys",
      "DEN": "Broncos",
      "DET": "Lions",
      "GB":  "Packers",
      "HOU": "Texans",
      "IND": "Colts",
      "JAX": "Jaguars",
      "KC":  "Chiefs",
      "LAR": "Rams",
      "LAC": "Chargers",
      "MIA": "Dolphins",
      "MIN": "Vikings",
      "NE":  "Patriots",
      "NO":  "Saints",
      "NYJ": "Jets",
      "NYG": "Giants",
      "OAK": "Raiders",
      "PHI": "Eagles",
      "PIT": "Steelers",
      "SF":  "49ers",
      "SEA": "Seahawks",
      "TB":  "Buccaneers",
      "TEN": "Titans",
      "WAS": "Redskins",
    }
  },
  cache: {}
};

function log(msg) {
  if (data.debug) {
    console.log(msg);
  }
}

function scan() {
  $('a.playernote:not([tierplus])').each(inject);
}

var observer = new MutationObserver(function(mutations) {
  scan();
});

function observe() {
  var node = document.querySelector('div#fantasy');
  if (node) observer.observe(node,{childList: true, characterData: false, attributes: false, subtree:true});
}

async function inject() {

  $(this).attr('tierplus', true);

  var s = $(this);
  var t = s.closest('td');
  var a = s.prev('a:not(.playernote)');
  while (a.length === 0 && !s.is(t)) {
    s = s.parent();
    a = s.find('a:not(.playernote):first');
  }
  if (!a || !a.length) return;

  var name = a.text();
  if (!name) return;

  var span = a.next();
  if (!span) return;

  var text = $(span).text();
  if (!text) return;

  var [team, role] = text.toUpperCase().split(/[\s-]+/);
  if (!team || !role) return;

  var roles = [].concat(role.split(','));
  if (roles.length === 0) return;

  var name_pattern = name;
  for (let [regex, str] of data.fix.name) {
    name_pattern = name_pattern.replace(regex, str);
  }

  var team_pattern = team;
  for (let [regex, str] of data.fix.team) {
    team_pattern = team_pattern.replace(regex, str);
  }

  if (data.fix.teamname[team_pattern]) {
    team_pattern = "("+team_pattern+"|"+data.fix.teamname[team_pattern]+")";
  }

  var pattern = name_pattern + "( " + team_pattern + ")?";
  var regex = new RegExp(pattern, 'i');

  var week = param('week');
  if (!week) {
    week = $("div#fantasy header span:first");
    if (week) {
      week = /.*?Week (\d+)/.exec(week.text());
      if (week) week = week[1];
    }
  }

  var mod = data[role].mod ? ('-' + data.mod) : '';

  for (let i in roles) {
    if (data[roles[i]].flex) {
      roles.unshift('F');
      break;
    }
  }

  log(pattern);

  var tags = [];
  for (let i in roles) {
    let role = roles[i];

    let src, png;
    if (week) {
      try {
        src = await fetch('week' + week + '/csv/week-' + week + '-' + data[role].file + mod + '.csv');
        png = 'week' + week + '/png/week-' + week + '-' + data[role].file + mod + '.png';
      } catch(e) {
        src = false;
      }
    }
    if (!src) {
      try {
        src = await fetch('current/csv/weekly-' + data[role].file + mod + '.csv');
        png = 'current/png/weekly-' + data[role].file + mod + '.png';
      } catch(e) {
        src = false;
      }
    }

    var match;
    for (let i = 0; src && i < src.length; i++) {
      var row = src[i];
      if (regex.test(row['Player.Name'])) {
        match = row;
        break;
      }
    }

    if (match) {
      log(match);
      var tier = role + match['Tier'];
      var group = [ name, team, role ].join(' - ');
      var hover = [
        'Best: ' + match['Best.Rank'],
        'Worst: ' + match['Worst.Rank'],
        'Avg: ' + round(match['Avg.Rank'],3),
        'StdDev: ' + round(match['Std.Dev'],3),
      ].join(', ');
      var label = match['Player.Name'] + ' - ' + tier + ' (' + hover + ')';
      tags.push('<a href="'+data.root+png+'" data-lightbox="'+group+'" data-title="'+label+'" class="tierplus" title="'+hover+'">'+tier+'</a>');
    } else if (role != 'F') {
      tags.push(role);
    }
  }

  $(span).html(team+' <span style="display:none;">- '+role+'</span>');
  $(span).append($(this).find('span.ysf-player-video-link')).find('a.yfa-video-playlist').text('');

  let tag = '<span class="Fz-xxs Lh-xs tierplus">'+tags.join(' ')+'&nbsp;</span>';
  let parent = $(this).parent();
  let injury = $(this).prev('.F-injury');
  if ($(parent).is('span')) {
    $(tag).insertAfter(parent).css({'float':'right'});
  } else {
    let target = injury.length ? injury : this;
    $(tag).insertBefore(target).css({'color':'#5f5f5f'});
  }
}

function fetch(url) {
  return data.cache.hasOwnProperty(url) ? data.cache[url] : (data.cache[url] =
    new Promise(function (resolve, reject) {
      GM_xmlhttpRequest({
        method: 'GET',
        url: data.root + url,
        onerror: function(response) {
          console.error(response);
          reject(response);
        },
        onload: function(response) {
          try {
            if (response.status != 200) throw response;
            log(response);
            resolve($.csv.toObjects(response.responseText));
          } catch(e) {
            console.error(e);
            reject(response);
          }
        }
      });
    })
  );
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function param(p) {
  var v = window.location.search.match(new RegExp('(?:[\?\&]'+p+'=)([^&]+)'));
  return v ? v[1] : null;
}

(function main() {

  scan();
  observe();

})();

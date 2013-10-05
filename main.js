// Generated by LiveScript 1.2.0
(function(){
  var split$ = ''.split, replace$ = ''.replace;
  $(function(){
    var score, key, record, items, MAX, LoadedScripts, restart, grokHash, refreshSeen, refreshTotal;
    score = 0;
    key = '';
    record = '';
    items = [];
    $('.hidden').hide();
    MAX = 10;
    $('#quit').click(function(){
      $('.log-line:last').remove();
      return $('#main').fadeOut(function(){
        return $('#again').show();
      });
    });
    $('#next').click(function(){
      var reason, choice, row;
      score++;
      reason = $('#reason').val().replace(/[\n,]/g, '，');
      choice = $('.choice.green').attr('id');
      row = key + "," + choice + "," + reason + "\n";
      switch (choice) {
      case 'x':
        $('.log-x:last').addClass('positive');
        $('.log-y:last').addClass('negative');
        break;
      case 'y':
        $('.log-x:last').addClass('negative');
        $('.log-y:last').addClass('positive');
        break;
      case 'z':
        $('.log-x:last').addClass('warning');
        $('.log-y:last').addClass('warning');
        break;
      case 'w':
        $('.log-x:last').addClass('active');
        $('.log-y:last').addClass('active');
      }
      if (choice !== 'w') {
        window.total++;
      }
      if (choice !== 'w') {
        window.unique++;
      }
      refreshTotal();
      $('.log-reason:last').text(reason);
      $.ajax({
        dataType: 'jsonp',
        url: "https://www.moedict.tw/dodo/log/?log=" + encodeURIComponent(row) + "&offset=" + window.seen.length,
        success: function(arg$){
          var delta;
          delta = arg$.delta;
          return refreshSeen(window.seen + delta);
        }
      });
      record += row;
      $('#progress-text').text(score + " / " + MAX);
      $('#progress-bar').css('width', score / MAX * 100 + "%");
      if (score >= MAX) {
        $('#main').fadeOut(function(){
          return $('#again').show();
        });
        return;
      }
      return refresh();
    });
    LoadedScripts = {};
    function getScript(src, cb){
      if (LoadedScripts[src]) {
        return cb();
      }
      LoadedScripts[src] = true;
      return $.ajax({
        type: 'GET',
        url: src,
        dataType: 'script',
        cache: true,
        crossDomain: true,
        complete: cb
      });
    }
    window.restart = restart = function(idx){
      idx == null && (idx = '');
      return window.location = document.URL.replace(/#.*$/, idx);
    };
    window.grokHash = grokHash = function(){
      if (/^#(\d+)/.exec(location.hash)) {
        refresh(RegExp.$1);
        return true;
      }
      return false;
    };
    getScript('data.js', function(){
      items = window.dodoData;
      return getScript('oxynyms.js?', function(){
        var retry;
        items = items.concat(window.dodoOxynyms);
        if (grokHash()) {
          return;
        }
        return (retry = function(){
          if (!window.total) {
            return setTimeout(retry, 100);
          }
          return refresh();
        })();
      });
    });
    refreshSeen = function(data){
      var processed, i$, ref$, len$, line, key;
      window.seen = data;
      window.total = 0;
      window.unique = 0;
      processed = '\n';
      for (i$ = 0, len$ = (ref$ = data.split(/[\r\n]/)).length; i$ < len$; ++i$) {
        line = ref$[i$];
        if (/^([^,]+,[^,]+),[xyz]/.exec(line)) {
          key = RegExp.$1;
          window.total++;
          if (!~processed.indexOf(key)) {
            window.unique++;
          }
          processed += key;
        }
      }
      return refreshTotal();
    };
    $.get("https://www.moedict.tw/dodo/log.txt?_=" + Math.random(), refreshSeen);
    refreshTotal = window.refreshTotal = function(){
      var percent, text;
      if (!items.length) {
        return setTimeout(refreshTotal, 100);
      }
      if (window.total < items.length) {
        percent = Math.floor(window.total / items.length * 1000) / 10;
        text = "第一階段「初校」。目前進度：" + window.total + " / " + items.length + " (" + percent + "%)";
      } else {
        percent = Math.floor(window.unique / items.length * 1000) / 10;
        text = "第二階段「交叉比對」。目前進度：" + window.unique + " / " + items.length + " (" + percent + "%)";
      }
      $('#total-bar').css('width', percent + "%");
      if ($('#total-text').text()) {
        return $('#total-text').text(text);
      }
      return setTimeout(function(){
        return $('#total-text').hide().text(text).fadeIn('fast');
      }, 500);
    };
    function pickItem(idx){
      var result, hash, e;
      idx || (idx = Math.floor(Math.random() * items.length));
      result = (function(){
        try {
          return items[+idx];
        } catch (e$) {}
      }());
      if (!result) {
        return pickItem();
      }
      items[idx] = null;
      hash = "#" + idx;
      if (/^#(\d+)/.exec(location.hash) && location.hash + "" !== hash) {
        try {
          history.pushState(null, null, hash);
        } catch (e$) {
          e = e$;
          location.replace(hash);
        }
      }
      $('#idx').text("#" + idx).attr('href', "https://www.moedict.tw/dodo/#" + idx);
      $('.share.button').each(function(){
        return $(this).attr('href', $(this).data('href') + "%23" + idx);
      });
      return result + "\n" + idx;
    }
    function refresh(fixedIdx){
      var ref$, book, xKey, x, yKey, y, idx, factor, comma, i$, len$, chunk;
      ref$ = split$.call(pickItem(fixedIdx), '\n'), book = ref$[0], xKey = ref$[1], x = ref$[2], yKey = ref$[3], y = ref$[4], idx = ref$[5];
      key = xKey + "," + yKey;
      if (!fixedIdx && ~window.seen.indexOf("\n" + key + ",")) {
        factor = RegExp('\\n' + key + ',[xyz]').exec(window.seen) ? 4 : 20;
        if (Math.floor(Math.random() * factor)) {
          return refresh();
        }
      }
      $('#book').text(book);
      $('#x').html(x.replace(/`/g, '<b>').replace(/~/g, '</b>'));
      $('#y').html(y.replace(/`/g, '<b>').replace(/~/g, '</b>'));
      $('#x-key').text(xKey);
      $('#y-key').text(yKey);
      $('#x-key-link').attr({
        href: "https://www.moedict.tw/#" + xKey,
        target: '_blank'
      });
      $('#y-key-link').attr({
        href: "https://www.moedict.tw/#" + yKey,
        target: '_blank'
      });
      $('#log').append($('<tr/>', {
        'class': 'log-line'
      }).append($('<td/>', {
        'class': 'book'
      }).text(book).append($("<span><br></span>").append($('<a/>', {
        'class': 'ui button mini key-link',
        href: "#" + idx,
        target: '_blank'
      }).text("重做").prepend($("<i class='icon repeat'></i>")))), $('<td/>', {
        'class': 'log-x'
      }).html($('#x').html()).append($("<span><br></span>").append($('<a/>', {
        'class': 'key-link',
        href: "https://www.moedict.tw/#" + xKey,
        target: '_blank'
      }).text(xKey).prepend($("<i class='icon external url'></i>")))), $('<td/>', {
        'class': 'log-y'
      }).html($('#y').html()).append($("<span><br></span>").append($('<a/>', {
        'class': 'key-link',
        href: "https://www.moedict.tw/#" + yKey,
        target: '_blank'
      }).text(yKey).prepend($("<i class='icon external url'></i>")))), $('<td/>', {
        'class': 'log-reason'
      })));
      $('.do-search').attr('target', '_blank');
      if (book === '教育部重編國語辭典修訂本') {
        $('#chain-links').text('');
        comma = "";
        for (i$ = 0, len$ = (ref$ = (replace$.call(y, /中.*/, '').replace(/的意思.*/, '').replace(/[「」]/g, '')).split('、')).length; i$ < len$; ++i$) {
          chunk = ref$[i$];
          $('#chain-links').append(comma).append($('<a/>', {
            'class': 'key-link',
            href: "https://www.moedict.tw/#" + chunk,
            target: '_blank'
          }).text("「" + chunk + "」").prepend($("<i class='icon external url'></i>")));
          comma = '、';
        }
        $('#key-links').hide();
        $('#chain-links').show();
        $('#type').text("相似相反詞類");
        $('.do-search.x').attr('href', "https://www.google.com.tw/#q=\"" + xKey + "\" \"" + yKey + "\" \"反義\"");
        $('.do-search.y').attr('href', "https://www.google.com.tw/#q=\"" + xKey + "\" \"" + yKey + "\" \"同義\"");
      } else {
        $('#key-links').show();
        $('#chain-links').hide();
        $('#type').text("引文用字");
        $('.do-search.x').attr('href', "https://www.google.com.tw/#q=\"" + x.replace(/[`~「」]/g, '') + "\"");
        $('.do-search.y').attr('href', "https://www.google.com.tw/#q=\"" + y.replace(/[`~「」]/g, '') + "\"");
      }
      $('#reason').val('');
      $('#proceed').fadeOut('fast');
      $('#notice').fadeIn('fast');
      $('.choice').removeClass('green');
      return $('.choice').off('click').click(function(){
        $('.choice').removeClass('green');
        $(this).addClass('green');
        $('.tag').off('click').click(function(){
          var this$ = this;
          return $('#reason').val(function(){
            return $('#reason').val() + "[" + $(this$).text() + "]";
          });
        });
        return $('#notice').fadeOut('fast', function(){
          return $('#proceed').fadeIn('fast', function(){
            return $('#reason').focus();
          });
        });
      });
    }
    return refresh;
  });
}).call(this);

(function(){

    let twitter = gTwitterNotifier;

    var _original = twitter.showBalloon;
    let prefs = {
      get max() {
        let result = 5;  // default
        try {
          result = twitter._util.pref().getIntPref('maximumMessages');
          dump("pref is " + result + "\n");
        } catch(e) {
          twitter._util.pref().setIntPref('maximumMessages', result);
          dump("pref is undefined\n");
        }
        return result;
      }
    };

    twitter.showBalloon = function() {
      dump(prefs.max);
      for (var i = 0; i < prefs.max; i++) {
        let msg = twitter._messageQueue.shift();
        dump(msg);
        if (!msg) return;

        setTimeout(function() {
          let user = msg.user || msg.sender;
          Growler.notify(user.screen_name, msg.text, user.profile_image_url);
        }, 1000 * i);
      }

      remainMessages = twitter._messageQueue.length;
      if (remainMessages) {
        setTimeout(function() {
          Growler.notify("TwitterFox", "And "+ remainMessages + " more tweet(s).");
          twitter._messageQueue = [];
        }, 1000 * i);
        return;
      }
    }

    // patch #1 
    var _original2 = twitter.updateBalloon;
    var newFunc = _original2.toString();
    newFunc = newFunc.replace(/^function\s+\(\)\s+{/, '');
    newFunc = newFunc.replace(/}$/, '');
    newFunc = newFunc.replace(/(if\s*\()(\s*count\s*>\s*[0-9]+\s*)(\)\s*{)/, "$1false$3");
    twitter.updateBalloon = new Function(newFunc);

    twitter.canPopup = function() true;

    // Growler object (singleton)
    const Growler = (function() {

      if (navigator.platform == 'Win32' && isGrowlInstalled()) {
        // for Windows
        let growl = Components.classes['@growlforwindows.com/growlgntp;1']
                    .getService().wrappedJSObject;
        growl.register(
          'TwitterFox',
          'http://www.hatena.ne.jp/images/top/side_b.gif',
          [{name: 'notify', displayName: 'notify'}]
        );
        return {
          notify: function(title, text, iconURL) {
            growl.notify( 'TwitterFox', 'notify', title, text, iconURL);
          }
        };
      }
      else {
        // for Mac
        let alertService = Components.classes["@mozilla.org/alerts-service;1"]
                          .getService(Components.interfaces.nsIAlertsService);
        return {
          notify: function(title, text, iconURL) {
            alertService.showAlertNotification(iconURL, title, text);
          }
        };
      }

      function isGrowlInstalled()
        Application.extensions.has('growlgntp@brian.dunnington');

      return {
        notify: function(){}
      };
    })();

})();


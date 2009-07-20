(function() {
  let prefs = function() {
    return Components.classes['@mozilla.org/preferences-service;1']
            .getService(Components.interfaces.nsIPrefService)
            .getBranch("extensions.twitternotifier.");
  };

  let scale  = document.getElementById("max-messages-scale");
  scale.value = prefs().getIntPref("maximumMessages");
  let label = document.getElementById("max-messages-label");

  scale.addEventListener("change", function(ev) {
    label.value = scale.value;
  }, false);

  label.value = scale.value;
})();

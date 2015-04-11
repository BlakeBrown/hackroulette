var indico = require('indico.io');
var settings = {
  "api_key": "04ad709a428e213f86e226d9610b2e86"
};

var single = "Blog posts about Android tech make better journalism than most news outlets.";
indico.textTags(single, settings)
  .then(function(res) {
    console.log(res);
  }).catch(function(err) {
    console.warn(err);
  });

var batch = [
  "Iran agress to nuclear limits, but key issues are unresolved.",
  "We're supposed to get up to 24 inches of snow in the storm."
];

indico.batchTextTags(batch, settings)
  .then(function(res) {
    console.log(res);
  }).catch(function(err) {
    console.warn(err);
  });
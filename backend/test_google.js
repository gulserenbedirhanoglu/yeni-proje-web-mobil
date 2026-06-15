const googleIt = require('google-it');
googleIt({ query: 'nefis yemek tarifleri tavuk pirinç' }).then(results => {
  console.log(results.slice(0, 2));
}).catch(e => {
  console.error(e);
});

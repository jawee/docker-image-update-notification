const dockerApi = require('docker-hub-api');
const fs = require('fs');
const config = require('../config.json');

let writeToCache = function(user, image, tag, date) {

  fs.writeFile("./cache/cache.json", image + date, (err) => { console.log(err); });
}

dockerApi.setCacheOptions({enabled: true, time:60});

config.images.forEach(i => {
  dockerApi.tags(i.user, i.image).then((tags) => {
    let tagInfo = tags.filter((t) => t.name == i.tag );
    if(tagInfo.length > 0) {
      tagInfo = tagInfo[0];
    } else {
      return;
    }
    console.log(i.image, tagInfo);
    writeToCache(i.user, i.image, i.tag, tagInfo.last_updated);
  });
}
);

const dockerApi = require('docker-hub-api');
const fs = require('fs');
const config = require('../config.json');

let writeToCache = function(user, image, tag, date) {
  // TODO 1: Figure out format
  fs.writeFile("./cache/cache.json", image + date, (err) => { console.log(err); });
}

let initApplication = function() {
  dockerApi.setCacheOptions({enabled: true, time:60});
  // TODO 1: Read cache
}

var getImageInformation = function(imageConfig) {
  return new Promise((resolve, reject) => {
    dockerApi.tags(imageConfig.user, imageConfig.image).then((tags) => {
      let tagInfo = tags.filter((t) => t.name == imageConfig.tag );
      if(tagInfo.length > 0) {
        tagInfo = tagInfo[0];
      } else {
        return;
      }
      imageConfig.last_updated = tagInfo.last_updated;
      resolve(imageConfig);
    }).catch((err) => { console.error(err); reject(err) } );
  });
}

let getImageInformations = function() {
  return new Promise((resolve, reject) => {
    let requests = [];
    config.images.forEach(i => {
      requests.push(getImageInformation(i));
    }); 

    Promise.all(requests).then((res) => {
      resolve(res);
    });
  });
}



initApplication();
getImageInformations().then(res => { imageInfos = res });


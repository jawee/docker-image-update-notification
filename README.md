# Docker Image Notification
[![Build Status](http://jenkins.home.jawee.se/buildStatus/icon?job=docker-image-update-notification%2Fmaster)](http://jenkins.home.jawee.se/job/docker-image-update-notification/job/master/)

Image can be found here https://hub.docker.com/r/jawee/image-update-notification

Notifies a discord channel when one of the images you're using is updated

Add a config to your specified config directory

Example:
```json
{
  "webhookId": "yourWebhookIdHere",
  "webhookToken": "yourWebhookTokenHere",
  "github_access_token": "yourAccessTokenHere",
  "images": [
    {
      "user": "linuxserver",
      "image": "docker-radarr",
      "tag": "latest",
      "registry": "github"
    },
    {
      "user": "linuxserver",
      "image": "couchpotato",
      "tag": "latest",
      "registry": "docker"
    }
  ]
}
```

```bash
docker run --name image-update-notification -v /usr/src/config:/usr/src/config image-update-notification:1.0
```

```bash
docker build --tag image-update-notification:1.0 .
```


```yml
version: '3'
services:
  docker-image-notification:
  image:  jawee/image-update-notification:latest
  restart: unless-stopped
  volumes:
    - ./config:/usr/src/config
```

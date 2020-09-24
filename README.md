# Docker Image Notification

Image can be found here https://hub.docker.com/r/jawee/image-update-notification

Notifies a discord channel when one of the images you're using is updated

Add a config to your specified config directory

Example:
```json
{
  "webhookId": "yourWebhookIdHere",
  "webhookToken": "yourWebhookTokenHere",
  "images": [
    {
      "user": "linuxserver",
      "image": "sickchill",
      "tag": "latest"
    },
    {
      "user": "linuxserver",
      "image": "couchpotato",
      "tag": "latest"
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


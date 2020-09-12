# Docker Image Notification

Notifies a discord channel when one of the images you're using is updated

```bash
docker run --name image-update-notification -v /Users/figge/Projects/node/docker-image-update-notification/config:/usr/src/config image-update-notification:1.0
```

```bash
docker build --tag image-update-notification:1.0 .
```

properties([pipelineTriggers([githubPush()])])

  pipeline {
    agent any

      stages {
        def app
          stage('Build image') {
            steps {
              app = docker.build("jawee/image-update-notification")
            }
          }

        stage('Test image') {
          /* TODO */

          steps {
            app.inside {
              sh 'echo "Tests passed"'
            }
          }
        }

        stage('Push image') {
          steps {
            docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
              app.push("${env.BUILD_NUMBE}")
              app.push("latest")
          }
          }
        }
      }
  }

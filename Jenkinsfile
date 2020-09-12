properties([pipelineTriggers([githubPush()])])

  pipeline {
    def app
      agent any

      stages {
        stage('Clone repository') {
          checkout scm
        }

        stage('Build image') {
          app = docker.build("jawee/image-update-notification")
        }

        stage('Test image') {
          /* TODO */

          app.inside {
            sh 'echo "Tests passed"'
          }
        }

        stage('Push image') {
          docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
            app.push("${env.BUILD_NUMBE}")
            app.push("latest")
        }
        }
      }


  }

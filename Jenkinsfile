properties([pipelineTriggers([githubPush()])])

  def app
  pipeline {
    agent any

      stages {
        stage('Build image') {
          steps {
            script {
              app = docker.build("jawee/image-update-notification")
            }

          }
        }

        stage('Test image') {
          /* TODO */

          steps {
            script {
              app.inside {
                sh 'echo "Tests passed"'
              }
            }
          }
        }

        stage('Push image') {
          when {
            branch 'master'
          }
          steps {
            script {
              docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                app.push("${env.BUILD_NUMBER}")
                app.push("latest")
              }
            }
          }
        }
      }
  }

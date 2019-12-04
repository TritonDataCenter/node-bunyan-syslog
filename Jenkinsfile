@Library('jenkins-joylib@v1.0.3') _

pipeline {

    agent {
        label joyCommonLabels(image_ver: '18.4.0')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '90'))
        timestamps()
    }

    tools {
        nodejs 'sdcnode-v6-zone64'
    }

    stages {
        stage('check') {
            steps{
                sh('make check')
            }
        }
    }

    post {
        always {
            joyMattermostNotification()
        }
    }

}

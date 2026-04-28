pipeline {
    agent any

    environment {
        DOCKER_HUB = "kunalmane"
        IMAGE_TAG = "v${BUILD_NUMBER}"
        DEPLOY_LOCAL = "true"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                bat 'cd frontend && npm install && cd ../backend && npm install'
            }
        }

        stage('Run Tests') {
            steps {
                dir('frontend') {
                    bat 'set CI=true && npm test'
                }
                dir('backend') {
                    bat 'npm test'
                }
            }
        }

        stage('Build Applications') {
            steps {
                bat 'cd frontend && npm run build && cd ../backend && npm run build'
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Frontend Image') {
                    steps {
                        bat 'docker build -t %DOCKER_HUB%/frontend:%IMAGE_TAG% -f frontend/Dockerfile ./frontend'
                    }
                }
                stage('Backend Image') {
                    steps {
                        bat 'docker build -t %DOCKER_HUB%/backend:%IMAGE_TAG% -f backend/Dockerfile ./backend'
                    }
                }
            }
        }

        stage('Deploy Containers') {
            when {
                expression { return env.DEPLOY_LOCAL == "true" }
            }
            steps {
                bat 'docker-compose down && docker-compose up -d'
            }
        }

        stage('Smoke Test') {
            steps {
                bat 'curl -f http://localhost:8090 || exit 1'
            }
        }

        // stage('Push Images') {
        //     steps {
        //         withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
        //             bat '''
        //             echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
        //             docker push %DOCKER_HUB%/frontend:%IMAGE_TAG%
        //             docker push %DOCKER_HUB%/backend:%IMAGE_TAG%
        //             '''
        //         }
        //     }
        // }
    }
}

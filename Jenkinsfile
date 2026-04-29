pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        DOCKER_HUB = "your-dockerhub-username"  // replace with your Docker Hub username
        IMAGE_TAG = "v${BUILD_NUMBER}"
        SONAR_PROJECT_KEY = "law-ai"             // replace with your SonarQube project key
    }

    stages {

        stage('Install Dependencies') {
            steps {
                sh 'cd frontend && npm install && cd ../backend && npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'cd frontend && CI=true npm run test:coverage'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner -Dsonar.projectKey=$SONAR_PROJECT_KEY'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Applications') {
            steps {
                sh 'cd frontend && npm run build'
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Frontend Image') {
                    steps {
                        sh 'docker build -t $DOCKER_HUB/frontend:$IMAGE_TAG -f frontend/Dockerfile ./frontend'
                    }
                }
                stage('Backend Image') {
                    steps {
                        sh 'docker build -t $DOCKER_HUB/backend:$IMAGE_TAG -f backend/Dockerfile ./backend'
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $DOCKER_HUB/frontend:$IMAGE_TAG
                    docker push $DOCKER_HUB/backend:$IMAGE_TAG
                    '''
                }
            }
        }

        stage('Update Config Repo') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-config-creds', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                    sh '''
                    git clone https://$GIT_USER:$GIT_PASS@github.com/<your-username>/<your-config-repo>.git config-repo
                    cd config-repo
                    sed -i "s|image: $DOCKER_HUB/frontend:.*|image: $DOCKER_HUB/frontend:$IMAGE_TAG|" frontend-deployment.yaml
                    sed -i "s|image: $DOCKER_HUB/backend:.*|image: $DOCKER_HUB/backend:$IMAGE_TAG|" backend-deployment.yaml
                    git config user.email "jenkins@ci"
                    git config user.name "Jenkins"
                    git add frontend-deployment.yaml backend-deployment.yaml
                    git commit -m "Update image tag to $IMAGE_TAG"
                    git push https://$GIT_USER:$GIT_PASS@github.com/<your-username>/<your-config-repo>.git main
                    '''
                }
            }
        }

    }
}

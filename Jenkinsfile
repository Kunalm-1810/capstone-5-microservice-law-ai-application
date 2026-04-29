pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        DOCKER_HUB = "kunalmane"  // replaced with your Docker Hub username
        IMAGE_TAG = "v${BUILD_NUMBER}"
        SONAR_PROJECT_KEY = "law-ai"             // replaced with your SonarQube project key
        GIT_USERNAME = "Kunalm-1810"    // replaced with your GitHub username
        CONFIG_REPO = "law-ai-config"            // replaced with  config repo name
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
                    script {
                        def scannerHome = tool 'SonarQube'
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${env.SONAR_PROJECT_KEY}"
                    }
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
                    docker push ''' + env.DOCKER_HUB + '''/frontend:''' + env.IMAGE_TAG + '''
                    docker push ''' + env.DOCKER_HUB + '''/backend:''' + env.IMAGE_TAG + '''
                    '''
                }
            }
        }

        stage('Update Config Repo') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-config-creds', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                    sh """
                    git clone https://\$GIT_USER:\$GIT_PASS@github.com/${env.GIT_USERNAME}/${env.CONFIG_REPO}.git config-repo
                    cd config-repo
                    sed -i "s|image: ${env.DOCKER_HUB}/frontend:.*|image: ${env.DOCKER_HUB}/frontend:${env.IMAGE_TAG}|" ansible-helm/Infra/k8s/frontend/deployment.yml
                    sed -i "s|image: ${env.DOCKER_HUB}/backend:.*|image: ${env.DOCKER_HUB}/backend:${env.IMAGE_TAG}|" ansible-helm/Infra/k8s/backend/deployment.yml
                    git config user.email "jenkins@ci"
                    git config user.name "Jenkins"
                    git add ansible-helm/Infra/k8s/frontend/deployment.yml ansible-helm/Infra/k8s/backend/deployment.yml
                    git commit -m "Update image tag to ${env.IMAGE_TAG}"
                    git push https://\$GIT_USER:\$GIT_PASS@github.com/${env.GIT_USERNAME}/${env.CONFIG_REPO}.git main
                    """
                }
            }
        }

    }
}

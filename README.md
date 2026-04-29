# ⚖️ Know Your Law AI — 3-Tier DevSecOps Project

A full-stack AI-powered Indian Legal Assistant built with React, Node.js, and MongoDB — deployed on Kubernetes using a complete CI/CD pipeline with Jenkins, SonarQube, Docker, ArgoCD, and GitHub Webhooks.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [CI/CD Pipeline Flow](#-cicd-pipeline-flow)
- [EC2 Setup](#-ec2-setup)
- [Jenkins Setup](#-jenkins-setup)
- [SonarQube Setup](#-sonarqube-setup)
- [Docker Hub Setup](#-docker-hub-setup)
- [GitHub Webhooks Setup](#-github-webhooks-setup)
- [Kubernetes & ArgoCD Setup](#-kubernetes--argocd-setup)
- [Jenkins Credentials](#-jenkins-credentials)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)

---

## 📖 Project Overview

**Know Your Law AI** is a 3-tier web application that allows users to:
- 💬 Ask questions about Indian law using AI (Gemini API)
- 📄 Review contracts and identify risky clauses
- 🕘 View chat and contract review history

---

## 🏗️ Architecture

```
User
 │
 ▼
Frontend (React + Nginx)        ← Port 80
 │
 ▼
Backend (Node.js + Express)     ← Port 5000
 │
 ▼
Database (MongoDB)              ← Port 27017
```

### CI/CD Architecture

```
Developer pushes code
        │
        ▼
   GitHub (App Repo)
        │  webhook
        ▼
     Jenkins EC2
        │
        ├── Install Dependencies
        ├── Run Tests (Jest + Coverage)
        ├── SonarQube Analysis
        ├── Quality Gate Check
        ├── Build React App
        ├── Build Docker Images (parallel)
        ├── Push to Docker Hub
        └── Update Config Repo (yq)
                │
                ▼
        GitHub (Config Repo)
                │  ArgoCD watches
                ▼
          Kubernetes Cluster
                │
                ▼
         ArgoCD Auto Deploy
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Axios, Nginx |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB 7 |
| AI | Google Gemini API |
| Containerization | Docker |
| Orchestration | Kubernetes |
| CI/CD | Jenkins |
| Code Quality | SonarQube |
| GitOps | ArgoCD |
| Registry | Docker Hub |
| Version Control | GitHub |

---

## 📁 Project Structure

```
3-tier-law-ai/
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── App.test.js
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── Dockerfile
│   └── package.json
├── Jenkinsfile
├── sonar-project.properties
├── docker-compose.yml
├── cleanup.sh
├── .gitignore
└── .dockerignore

k8s-arcgocd-config-repo/
└── ansible-helm/
    └── Infra/
        └── k8s/
            ├── frontend/
            │   ├── deployment.yml
            │   ├── fe_service.yml
            │   └── node-port-service.yml
            ├── backend/
            │   ├── deployment.yml
            │   └── be_service.yml
            ├── mongo/
            │   ├── deployment.yml
            │   ├── pv.yml
            │   ├── pvc.yml
            │   └── service.yml
            ├── ingress.yml
            └── secret.yml
```

---

## 🔄 CI/CD Pipeline Flow

```
1. GitHub push triggers Jenkins via webhook
2. Jenkins pulls code from GitHub
3. npm install (frontend + backend)
4. Run tests with coverage (Jest)
5. SonarQube analysis
6. Quality Gate check (aborts if fails)
7. Build React production app
8. Build Docker images (frontend + backend in parallel)
9. Push images to Docker Hub with tag v{BUILD_NUMBER}
10. Clone config repo → update image tags using yq → push back
11. ArgoCD detects config repo change → deploys to Kubernetes
```

---

## ☁️ EC2 Setup

### Requirements
| Component | Instance Type | Ports |
|---|---|---|
| Jenkins + SonarQube | t3.medium (2 vCPU, 4GB RAM) | 8080, 9000 |

### Security Group Inbound Rules
| Port | Source | Purpose |
|---|---|---|
| 22 | Your IP | SSH |
| 8080 | 0.0.0.0/0 | Jenkins |
| 9000 | 0.0.0.0/0 | SonarQube |

> ⚠️ Allocate an **Elastic IP** to your EC2 to prevent IP changes on restart.

### Install Docker on EC2
```bash
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
sudo usermod -aG docker jenkins
```

### Install Node.js on EC2
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### Install yq on EC2
```bash
sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
sudo chmod +x /usr/local/bin/yq
```

### Setup Disk Cleanup Cron Job
```bash
sudo cp cleanup.sh /usr/local/bin/cleanup.sh
sudo chmod +x /usr/local/bin/cleanup.sh
echo "0 0 * * * root /usr/local/bin/cleanup.sh >> /var/log/cleanup.log 2>&1" | sudo tee -a /etc/crontab
```

---

## 🔧 Jenkins Setup

### Install Jenkins
```bash
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
sudo yum install jenkins java-17-amazon-corretto -y
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

Access Jenkins at: `http://<ec2-public-ip>:8080`

### Required Jenkins Plugins
- Git
- GitHub Integration
- Pipeline
- SonarQube Scanner
- Docker Pipeline
- Credentials Binding

### Jenkins Tools Configuration
- Manage Jenkins → Tools → SonarQube Scanner
  - Name: `SonarQube`
  - Install automatically ✅
  - Name: Github integration
  - Install automatically


### Jenkins System Configuration
- Manage Jenkins → System → SonarQube servers
  - Name: `SonarQube`
  - Server URL: `http://localhost:9000`
  - Token: select `sonar-token` credential

### Jenkins Job Configuration
- New Item → Pipeline
- Pipeline → Definition: `Pipeline script from SCM`
- SCM: Git
- Repository URL: `https://github.com/<username>/<app-repo>`
- Branch: `*/main`
- Script Path: `Jenkinsfile`
- Build Triggers: ✅ `GitHub hook trigger for GITScm polling`

---

## 📊 SonarQube Setup

### Run SonarQube with Docker (persistent storage)
```bash
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_logs:/opt/sonarqube/logs \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  sonarqube:lts-community
```

Access SonarQube at: `http://<ec2-public-ip>:9000`
Default credentials: `admin` / `admin`

### SonarQube Project Setup
1. Login → Projects → Create Project → Manually
   - Project key: `law-ai`
   - Display name: `Law AI`
2. My Account → Security → Generate Token
   - Name: `jenkins-token`
   - Type: `Global Analysis Token`
   - Copy the token

### SonarQube Webhook
- Administration → Configuration → Webhooks → Create
  - Name: `jenkins`
  - URL: `http://<ec2-public-ip>:8080/sonarqube-webhook/`
  - Secret: leave empty

---

## 🐳 Docker Hub Setup

1. Login to [hub.docker.com](https://hub.docker.com)
2. Create 2 repositories:
   - `<username>/frontend`
   - `<username>/backend`
3. Generate Access Token:
   - Account Settings → Security → New Access Token
   - Name: `jenkins-token`
   - Permissions: Read & Write
   - Copy the token

---

## 🔗 GitHub Webhooks Setup

### App Repo Webhook
- GitHub repo → Settings → Webhooks → Add webhook
  - Payload URL: `http://<ec2-public-ip>:8080/github-webhook/`
  - Content type: `application/json`
  - Event: `Just the push event`

### Config Repo
- Create a separate GitHub repo: `k8s-arcgocd-config-repo`
- Push all Kubernetes manifests to this repo
- ArgoCD watches this repo for changes

---

## ☸️ Kubernetes & ArgoCD Setup

### Apply Kubernetes Secrets (manually — never commit real secrets)
```bash
kubectl apply -f secret.yml
```

### Apply All Manifests
```bash
kubectl apply -f ansible-helm/Infra/k8s/mongo/
kubectl apply -f ansible-helm/Infra/k8s/backend/
kubectl apply -f ansible-helm/Infra/k8s/frontend/
kubectl apply -f ansible-helm/Infra/k8s/ingress.yml
```

### Install ArgoCD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### ArgoCD Application Setup
- Login to ArgoCD UI
- New App:
  - App Name: `law-ai`
  - Project: `default`
  - Sync Policy: `Automatic`
  - Repo URL: `https://github.com/<username>/k8s-arcgocd-config-repo`
  - Path: `ansible-helm/Infra/k8s`
  - Cluster: `in-cluster`
  - Namespace: `default`

---

## 🔑 Jenkins Credentials

| ID | Kind | Purpose |
|---|---|---|
| `jenkins-github-push-ci` | Username/Password | Checkout app repo from GitHub |
| `github-config-repo` | Username/Password | Push to config repo on GitHub |
| `jenkins-dockerhub` | Username/Password | Push images to Docker Hub |
| `sonar-token` | Secret text | SonarQube analysis authentication |

> Use GitHub **Personal Access Token** (PAT) with `repo` scope as password for GitHub credentials.
> Use Docker Hub **Access Token** as password for Docker Hub credentials.

---

## 🌍 Environment Variables

### backend/.env (never commit this file)
```
GEMINI_API_KEY=<your-gemini-api-key>
MONGO_URI=mongodb://mongo:27017/lawai
```

### Kubernetes Secret (apply manually)
```bash
kubectl apply -f secret.yml
```

---

## 💻 Running Locally

### Prerequisites
- Node.js 20+
- Docker
- MongoDB

### Using Docker Compose
```bash
# create backend/.env file first
echo "GEMINI_API_KEY=<your-key>" > backend/.env
echo "MONGO_URI=mongodb://mongo:27017/lawai" >> backend/.env

# start all services
docker-compose up -d

# access app
open http://localhost:8090
```

### Without Docker
```bash
# install dependencies
cd frontend && npm install
cd ../backend && npm install

# start backend
cd backend && node server.js

# start frontend
cd frontend && npm start
```

---

## ⚠️ Disclaimer

This application provides legal **information** only, not legal **advice**. Always consult a qualified legal professional for legal matters.

---

## 👨‍💻 Author

**Kunal Mane** — DevOps Engineer
**kode.techm@gmail.com** - Email id
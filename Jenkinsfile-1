pipeline {
    agent any

    tools {
        maven "MAVEN_HOME"
    }

    environment {
        PROJECT_ROOT = 'src'
        EMAIL_ADDRESS = 'mingerez@gmail.com'
        REGISTRY = 'mgerez/ddsdeploy'
        SONARQUBE_URL = 'http://192.168.68.10:9000'
        SONAR_TOKEN = 'squ_a7527e83837cbf2cdadd75919d6ee3d7befd320a'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Realizando checkout del repositorio...'
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/mgerezqa/dds-app-libros-deploy.git']]])
            }
        }

        stage('Dependencies') {
            steps {
                echo 'Instalando dependencias...'
                sh "mvn install -DskipTests"
            }
        }

        stage('Test') {
            steps {
                echo 'Ejecutando los tests...'
                sh "mvn test"
            }
        }

        stage('SonarQube Scan') {
            environment {
                scannerHome = tool 'sonar-scanner'
            }
            steps {
                echo 'Escaneando el código con SonarQube...'
                withSonarQubeEnv('sonarqube') {
                    sh "mvn sonar:sonar -Dsonar.projectKey=dds-app-libros-deploy -Dsonar.host.url=${SONARQUBE_URL} -Dsonar.login=${SONAR_TOKEN} -Pcoverage"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Construyendo la imagen Docker...'
                sh "docker build -t ${REGISTRY}:latest ."
            }
        }

        stage('Deploy Docker Image') {
            steps {
                echo 'Subiendo la imagen a Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                    // Iniciar sesión en Docker con credenciales enmascaradas
                    sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASSWORD}"

                    // Subir la imagen a Docker Hub
                    sh "docker push ${REGISTRY}:latest"
                }
            }
        }

        stage('Deploy Image to Kubernetes') {
            steps {
                echo 'Desplegando la imagen en Kubernetes...'
                withCredentials([usernamePassword(credentialsId: 'kubernetes-credentials', usernameVariable: 'KUBERNETES_USER', passwordVariable: 'KUBERNETES_PASSWORD')]) {
                    // Iniciar sesión en Kubernetes con credenciales enmascaradas
                    sh "kubectl login -u ${KUBERNETES_USER} -p ${KUBERNETES_PASSWORD}"

                    // Desplegar la imagen en Kubernetes
                    sh "kubectl apply -f k8s/deployment.yaml"
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline ejecutado correctamente.'
        }
        failure {
            echo 'Pipeline fallido.'
        }
    }
}

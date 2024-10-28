pipeline {
    agent any

    tools {
        maven "MAVEN_HOME"
    }

    environment {
        PROJECT_ROOT = 'src'
        EMAIL_ADDRESS = 'mingerez@gmail.com'
        REGISTRY = 'mgerez/ddsdeploy'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo 'Realizando checkout del repositorio...'
                    checkout([$class: 'GitSCM',
                        branches: [[name: '*/main']],
                        extensions: [],
                        userRemoteConfigs: [[url: 'https://github.com/mgerezqa/dds-app-libros-deploy.git']]
                    ])
                }
            }
        }

        stage('Dependencies') {
            steps {
                script {
                    echo 'Instalando dependencias...'
                    sh "mvn install -DskipTests"
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    echo 'Ejecutando los tests...'
                    sh "mvn test"
                    // Generar reportes de Surefire en HTML
                    sh "mvn surefire-report:report"
                }
            }
        }

        stage('Publish Test Reports') {
            steps {
                script {
                    echo 'Publicando reportes HTML...'
                    publishHTML(target: [
                        reportDir: 'target/site',
                        reportFiles: 'surefire-report.html',
                        reportName: 'Surefire Test Report',
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true
                    ])

                    publishHTML(target: [
                        reportDir: 'target/site/jacoco',
                        reportFiles: 'index.html',
                        reportName: 'Jacoco Coverage Report',
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true
                    ])
                }
            }
        }

        stage('SonarQube Scan') {
            environment {
                scannerHome = tool 'sonar-scanner'
            }
            steps {
                script {
                    echo 'Escaneando el código con SonarQube...'
                    withCredentials([
                        string(credentialsId: 'sonar-url-credential-jenkinsfile', variable: 'SONARQUBE_URL'),
                        string(credentialsId: 'sonar-token-credential-jenkinsfile', variable: 'SONAR_TOKEN')
                    ]) {
                        withSonarQubeEnv('sonarqube') {
                            sh('mvn sonar:sonar -Dsonar.projectKey=dds-app-libros-deploy -Dsonar.host.url=${SONARQUBE_URL} -Dsonar.login=${SONAR_TOKEN} -Pcoverage')
                        }
                    }
                }
            }
        }

        stage('Build Docker Image') {
            agent { label 'minikube' }
            steps {
                script {
                    echo 'Construyendo la imagen Docker...'
                    sh "docker build -t ${REGISTRY}:latest ."
                }
            }
        }

        stage('Deploy Docker Image') {
            agent { label 'minikube' }
            steps {
                script {
                    echo 'Subiendo la imagen a Docker Hub...'
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
                        // Iniciar sesión en Docker con credenciales enmascaradas
                        sh('docker login -u ${DOCKER_USER} -p ${DOCKER_PASSWORD}')

                        // Subir la imagen a Docker Hub
                        sh "docker push ${REGISTRY}:latest"
                    }
                }
            }
        }

        stage('Check KUBECONFIG') {
            agent { label 'minikube' }
            steps {
                script {
                    // Verificar la variable de entorno KUBECONFIG
                    echo "Current KUBECONFIG: ${env.KUBECONFIG}"

                    sh 'kubectl version --client'
                    sh 'minikube version'
                    sh 'minikube start'

                    // Listar los contextos disponibles
                    sh 'kubectl config get-contexts'

                    // Verificar el estado de minikube
                    sh 'minikube status || { echo "Minikube is not running."; exit 1; }'
                }
            }
        }

        stage('Deployment'){
            agent { label 'minikube' }
                    steps {
                        script {
                            echo 'Desplegando app...'
                            sh 'kubectl apply -f postgres-secret.yaml'
                            sh 'kubectl apply -f postgres-deployment.yaml'
                            sh 'kubectl apply -f javalin-app-deployment.yaml'
                        }
                    }
        }

        stage('Restart Deployment') {
            agent { label 'minikube' }
            steps {
                script {
                    echo 'Reiniciando el deployment...'
                    sh 'kubectl rollout restart deployment javalin-app'

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

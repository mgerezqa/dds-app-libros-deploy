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
                            checkout([$class: 'GitSCM', branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/mgerezqa/dds-app-libros-deploy.git']]])
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
                        reportDir: 'target/site', // Carpeta donde se generan los reportes HTML
                        reportFiles: 'surefire-report.html', // Archivo del reporte HTML
                        reportName: 'Surefire Test Report',
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true
                    ])

                    publishHTML(target: [
                        reportDir: 'target/site/jacoco', // Carpeta donde se generan los reportes de Jacoco
                        reportFiles: 'index.html', // Archivo del reporte HTML
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
                    // Uso de credenciales para obtener la URL de SonarQube y el token
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
            agent{ label 'minikube'}
            steps {
                    script{
                        echo 'Construyendo la imagen Docker...'
                        sh('service docker start')
                        sh "docker build -t ${REGISTRY}:latest ."
                }
            }
        }

        stage('Deploy Docker Image') {
            agent{ label 'minikube'}
            steps {
                    script{
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

        stage('Restart Deployment')
        {
            agent{ label 'minikube'}
            steps {
                script {
                    echo 'Reiniciando el deployment...'
                    sh '''
                    kubectl config use-context minikube
                    minikube kubectl -- rollout restart deployment javalin-app-deployment
                    '''
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

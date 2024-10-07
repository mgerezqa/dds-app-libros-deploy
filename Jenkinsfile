pipeline {
    agent any

    environment {
        // General Variables for Pipeline
        PROJECT_ROOT = 'src'
        EMAIL_ADDRESS = 'mingerez@gmail.com'
        REGISTRY = 'mgerez/ddsdeploy'
        SONARQUBE_URL = 'http://192.168.68.10:9000'  // URL de tu SonarQube
        SONAR_LOGIN = 'admin'  // Usuario de SonarQube
        SONAR_PASSWORD = 'sonar2024'  // Contraseña de SonarQube
    }

    stages {
        stage('Checkout') {
            steps {
                // Obtener el código fuente desde el repositorio GitHub
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
                // Correr los tests con JUnit y Maven
                sh "mvn test"
            }
        }

        stage('SonarQube Scan') {
            environment {
                scannerHome = tool 'sonar-scanner'  // Nombre configurado en Jenkins para Sonar Scanner
            }
            steps {
                echo 'Escaneando el código con SonarQube...'
                withSonarQubeEnv('sonarqube') { // Usar el entorno configurado para SonarQube
                    sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=dds-app-libros-deploy \
                        -Dsonar.projectName=dds-app-libros-deploy \
                        -Dsonar.projectVersion=0.0.${BUILD_NUMBER} \
                        -Dsonar.host.url=${SONARQUBE_URL} \
                        -Dsonar.sources=./${PROJECT_ROOT} \
                        -Dsonar.login=${SONAR_LOGIN} \
                        -Dsonar.password=${SONAR_PASSWORD} \
                        -Dsonar.tests=./${PROJECT_ROOT}/test \
                        -Dsonar.java.binaries=./${PROJECT_ROOT}/target/classes
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Construyendo la imagen Docker...'
                sh "docker build -t ${REGISTRY}:${BUILD_NUMBER} ./"
            }
        }

        stage('Deploy Docker Image') {
            steps {
                echo 'Subiendo la imagen a Docker Hub...'
                sh "docker login -u <tu-usuario> -p <tu-password>"
                sh "docker push ${REGISTRY}:${BUILD_NUMBER}"
            }
        }
    }

    post {
        success {
            echo 'Pipeline ejecutado correctamente.'
            // Puedes agregar notificaciones por email aquí si lo necesitas
        }
        failure {
            echo 'Pipeline fallido.'
        }
    }
}

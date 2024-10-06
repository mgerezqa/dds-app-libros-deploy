pipeline{
    agent any
        stages{
                stage('Build'){
                                steps{
                                    echo 'Building the application...'
                                    }
                                }
                stage('Test'){
                                steps{
                                    echo 'Testing the application...'
                                    }
                              }
                stage('Deploy'){
                                steps{
                                    echo 'Deploying the application...'
                                    sh "docker-compose down -v"
                                    sh "docker-compose up -d --build"
                                    }
                                }
                }
        }
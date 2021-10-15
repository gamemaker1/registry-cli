// Configuration for the application

// Repository to fetch setup files from
export const setupFilesRepository =
	'https://github.com/gamemaker1/registry-setup-files.git'
// Names of the images that are used to run the registry
export const containerImages = [
	'docker.elastic.co/elasticsearch/elasticsearch:7.10.1',
	'postgres',
	'dockerhub/sunbird-rc-core',
	'dockerhub/ndear-keycloak',
]

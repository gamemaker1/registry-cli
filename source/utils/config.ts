// Configuration for the application

import Conf from 'conf'

import * as PackageMetadata from '../../package.json'

// Read the config file first
const conf = new Conf({
	projectName: 'registry-cli',
	projectSuffix: '',
	projectVersion: PackageMetadata.version,
})

// Repository to fetch setup files from
export const setupFilesRepository: string =
	(conf.get('setupFilesRepository') as string | undefined) ??
	'https://github.com/gamemaker1/registry-setup-files.git'

// Names of the images that are used to run the registry
// IMPORTANT: Make sure the registry image is the first one
export const containerImages: string[] = (conf.get('containerImages') as
	| string[]
	| undefined) ?? [
	'dockerhub/sunbird-rc-core',
	'docker.elastic.co/elasticsearch/elasticsearch:7.10.1',
	'postgres',
	'dockerhub/ndear-keycloak',
]

// Names of the containers running the registry
// IMPORTANT: Make sure the registry container's name is the first one
export const containerNames: string[] = (conf.get('containerNames') as
	| string[]
	| undefined) ?? ['rg', 'es', 'db', 'kc']

// Keycloak related details
// The URL on which the keycloak server is running
export const keycloakUri = 'http://kc:8080'
// The realm to use in keycloak
export const keycloakRealm = 'sunbird-rc'
// The client to treat as admin client
export const keycloakAdminClientId = 'admin-api'
// The variable to set in the docker compose for the admin secret
export const keycloakClientSecretEnvVar = 'sunbird_sso_admin_client_secret'
// The default administrator username and password
export const keycloakAdminUsername = 'admin'
export const keycloakAdminPassword = 'admin'

// Helper methods to interact with docker

import Docker from 'dockerode'
import * as Config from '../utils/config'

// Create a docker instance
const docker = new Docker()

// Type representing a container
type Container = {
	// Name of the container
	name: string
	// 12 character ID of the container
	id: string
	// Image that is running inside the container
	image: string
	// Current state of the container
	status: string
}

// Method to list and return registry-related containers
export const listContainers = async (config?: {}): Promise<Container[]> => {
	return docker
		.listContainers(config)
		.then((containers) => {
			// Convert the returned object to our Container type
			return containers.map((containerInfo) => {
				return {
					name: containerInfo.Names[0],
					id: containerInfo.Id.slice(0, 12),
					image: containerInfo.Image,
					status: containerInfo.State,
				}
			})
		})
		.then((containers) => {
			// Filter out those that are not registry-related
			return containers.filter((containerInfo) =>
				Config.containerImages.some((image) =>
					containerInfo.image.includes(image)
				)
			)
		})
		.then((containers) => {
			// Check if there are any registry-related containers
			if (containers?.length <= 0) {
				throw new Error('Could not find any registry related containers')
			}

			return containers
		})
}

// Methods to restart, start and stop a container
export const restartContainer = (id: string): Promise<void> => {
	return docker.getContainer(id).restart()
}
export const startContainer = (id: string): Promise<void> => {
	return docker.getContainer(id).start()
}
export const stopContainer = (id: string): Promise<void> => {
	return docker.getContainer(id).stop()
}

# Registry CLI

A CLI to create and interact with Sunbird RC registry instances.

## Prerequisites

> This guide assumes a some familiarity with basic linux commands. If not,
> [here](https://ubuntu.com/tutorials/command-line-for-beginners#1-overview) is
> a great place to start.

### Terminal emulator

Linux and MacOS will have a terminal installed already. For Windows, it is
recommended that you use `git-bash`, which you can install from
[here](https://git-scm.com/download/win).

Type `echo Hi` in the terminal once it is installed. If installed correctly, you
should see `Hi` appear when you hit enter.

### NodeJS

Installation instructions for NodeJS can be found
[here](https://nodejs.org/en/download/package-manager/).

Run `node -v` in the terminal if `node` has been installed correctly:

```sh
$ node -v
v16.11.0
```

### Docker

Installation instructions for Docker can be found
[here](https://docs.docker.com/engine/install/).

Run `docker -v` in terminal to check if `docker` has been installed correctly:

```sh
$ docker -v
Docker version 20.10.9, build c2ea9bc90b
```

### Docker Compose

Installation instructions can be found
[here](https://docs.docker.com/engine/install/).

Run `docker-compose -v` in terminal to check if `docker-compose` has been
installed correctly:

```sh
$ docker-compose -v
Docker Compose version 2.0.1
```

## Installing the CLI

To install the CLI, run:

```sh
$ npm install --global registry-cli
```

## Getting Started

Run the following command in a directory where you wish to setup the registry.
For this example, we will use `~/Registries/example/`. (`~` is short form for
the user's home directory).

```sh
# Create and move into the ~/Registries/example directory
$ mkdir -p ~/Registries/example
$ cd ~/Registries/example
# Create a registry instance
$ registry init
```

This will setup and start a registry using Docker on your machine.

## Understanding schemas

Each registry can store data as entities. The example registry setup by the CLI
already has two entities declared in it: `Teacher` and `Student`. To view the
schemas, run the following:

```sh
$ cat schemas/student.json
$ cat schemas/teacher.json
```

A teacher is represented by 5 fields: `name`, `phoneNumber`, `email`, `subject`
and `school`, out of which `name`, `phoneNumber`, `email` and `school` are
required fields. `subject` can be any one of Math, Hindi, English, History,
Geography, Physics, Chemistry, and Biology.

A student is represented by 4 fields: `name`, `phoneNumber`, `email`, and
`school`, all of which are required fields. When setting `school` field, you are
making a 'claim' (i.e., that the student is from the specified school), which
can be 'attested' (i.e., confirmed to be true) by a teacher from the same
school.

> Documentation in progress...

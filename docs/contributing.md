# Contributing Guide

Thanks for your interest in `registry-cli`! You can contribute in any of the
following ways:

- Reporting bugs
- Improving documentation
- Fixing bugs
- Adding new features

## Reporting Bugs

Open an issue using the `Bug Report` template
[here](https://github.com/gamemaker1/registry-cli/issues/new/choose)!

## Improving Documentation

Documentation is in the form of markdown files in the `docs` directory of the
repository. Feel free to edit it to:

- to make the docs clearer/easier to understand
- fix typos
- add a section about something new
- add something that was previously left out of docs

## Fixing Bugs/Adding New Features

The CLI is written in Typescript. To contribute to code, first setup your dev
environment.

### Prepare Up Your Environment

> This guide assumes a some familiarity with basic linux commands. If not,
> [here](https://ubuntu.com/tutorials/command-line-for-beginners#1-overview) is
> a great place to start.

#### Terminal emulator

Linux and MacOS will have a terminal installed already. For Windows, it is
recommended that you use `git-bash`, which you can install from
[here](https://git-scm.com/download/win).

Type `echo Hi` in the terminal once it is installed. If installed correctly, you
should see `Hi` appear when you hit enter.

#### Git

Installation instructions for Git can be found
[here](https://github.com/git-guides/install-git).

Run `git --version` in the terminal if `git` has been installed correctly:

```sh
$ git --version
git version 2.33.0
```

#### NodeJS

Installation instructions for NodeJS can be found
[here](https://nodejs.org/en/download/package-manager/). We use the latest
version of NodeJS (`16.x`) for developing the CLI.

Run `node --version` in the terminal if `node` has been installed correctly:

```sh
$ node --version
v16.11.0
```

#### PNPM

Once NodeJS is installed, run the following in terminal to install PNPM:

```sh
$ sudo npm install --global pnpm
```

Run `pnpm --version` in the terminal if `pnpm` has been installed correctly:

```sh
$ pnpm --version
6.17.1
```

#### Docker

Installation instructions for Docker can be found
[here](https://docs.docker.com/engine/install/).

Run `docker --version` in terminal to check if `docker` has been installed
correctly:

```sh
$ docker --version
Docker version 20.10.9, build c2ea9bc90b
```

#### Docker Compose

Installation instructions can be found
[here](https://docs.docker.com/engine/install/).

Run `docker-compose --version` in terminal to check if `docker-compose` has been
installed correctly:

```sh
$ docker-compose --version
Docker Compose version 2.0.1
```

### Clone Your Forked Repository

Once you have your installed all of the above tools, fork the repository on
Github: https://github.com/gamemaker1/registry-cli. For instructions on how to
fork a repository, read through
[this](https://docs.github.com/en/get-started/quickstart/fork-a-repo).

Then, clone the repository on your computer using `git`:

```sh
$ git clone git@github.com:<your github username>/registry-cli.git
```

This will create a directory called `registry-cli`, which contains all the
source code to run the CLI. Move into the directory by typing the following:

```sh
$ cd registry-cli
```

Then, add the `upstream` remote so you can fetch the latest changes from the
main repository and merge them into your fork:

```sh
$ git remote add upstream git@github.com:gamemaker1/registry-cli.git
```

To merge the latest changes into your fork anytime, run:

```sh
$ git pull upstream main
```

### Create A Branche

To keep your development environment organized, create local branches to hold
your work. These should be branched directly off of the `main` branch. While
naming branches, try to name it according to the bug it fixes or the feature it
adds. Also prefix the branch with the type of change it is making. Here is a
list of common prefixes:

| Name       | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| `fix`      | A bug fix                                                    |
| `feature`  | A new feature                                                |
| `docs`     | Documentation changes                                        |
| `perf`     | A code change that improves performance                      |
| `refactor` | A code change that neither fixes a bug nor adds a feature    |
| `test`     | A change to the tests                                        |
| `style`    | Changes that do not affect the meaning of the code (linting) |

To create a branch and switch to it, run the following:

```sh
$ git checkout -b my/branch -t upstream/main
```

### Build

To make sure you can run your development version of the CLI using the
`registry` command, run the following commands in the `registry-cli` folder:

```sh
# In case you have already installed the CLI from npm, remove it
$ sudo npm rm -g registry-cli
# Build the CLI
$ pnpm build
# Creates a global symlink to the current directory
$ sudo npm i -g .
# Watches the files for changes and recompiles the CLI if it detects any changes
$ pnpm watch
```

Now you can make changes to the source code, and test the CLI using the
`registry` command.

### Code Structure

The source directory looks something like this:

```
source
├── commands
│  ├── ...
├── helpers
│  └── ...
├── utils
│  └── ...
└── main.ts
```

The `commands` directory contains code for each command. The `helpers` directory
contains code that makes it easier to interface with a tool like Docker. The
`utils` folder contains utility functions to manage configuration or output. The
`main.ts` file contains code to initialize the CLI.

If you are adding a new command, create a new file in the `commands` directory
with the name of the command. That file should export a default async function
that takes no arguments. Then import and register that command in `main.ts`.

To keep it simple, configuration of the CLI should be done through the
configuration file and the `registry config` command, not through options.

### Document

Once your changes are ready to go, begin the process of documenting your code.
The code must be well commented, so future contributors can move around and make
changes easily.

If you are adding new features, or making changes to the behaviour of existing
features, make sure to update the relevant `docs` files in the `docs` folder.

### Test

Once you are done documenting code, run the formatter, linter and tests:

```sh
$ pnpm test
```

Please ensure that the tests pass! To fix some issues automatically, try
running:

```sh
$ pnpm fix:eslint
$ pnpm fix:format
```

### Commit

It is recommended to keep your changes grouped logically within individual
commits. Many contributors find it easier to review changes that are split
across multiple commits. There is no limit to the number of commits in a pull
request.

```
$ git add my/changed/files
$ git commit -m 'commit message...'
```

Note that multiple commits often get squashed when they are landed.

Please follow the [conventional commit style](https://conventionalcommits.org)
when writing commit messages.

### Push

Once you have documented your code as required, begin the process of opening a
pull request by pushing your working branch to your fork on GitHub.

```
$ git push origin my/branch
```

### Open A Pull Request

From within GitHub, opening a
[new pull request](https://github.com/gamemaker1/registry-cli/compare) will
present you with a template that should be filled out.

### Discuss and update

You will probably get feedback or requests for changes to your pull request.
This is a big part of the submission process, so don't be discouraged! Some
contributors may sign off on the pull request right away. Others may have
detailed comments or feedback. This is a necessary part of the process in order
to evaluate whether the changes are correct and necessary.

To make changes to an existing pull request, make the changes to your local
branch, add a new commit with those changes, and push those to your fork. GitHub
will automatically update the pull request.

```sh
$ git add my/changed/files
$ git commit
$ git push origin my/branch
```

There are a number of more advanced mechanisms for managing commits using
`git rebase` that can be used, but are beyond the scope of this guide. Also, any
branch that is being merged must be merged without fast forward, i.e.,
`git merge --no-ff ...`.

Feel free to post a comment in the pull request to ping reviewers if you are
awaiting an answer on something.

**Approval and Request Changes Workflow**

All pull requests require approval from at least one maintainer in order to
land. Whenever a maintainer reviews a pull request they may request changes.
These may be small, such as fixing a typo, or may involve substantive changes.
Such requests are intended to be helpful, but at times may come across as abrupt
or unhelpful, especially if they do not include concrete suggestions on _how_ to
change them.

Try not to be discouraged. Try asking the maintainer for advice on how to
implement it. If you feel that a review is unfair, say so or seek the input of
another project contributor. Often such comments are the result of a reviewer
having taken insufficient time to review and are not ill-intended. Such
difficulties can often be resolved with a bit of patience. That said, reviewers
should be expected to provide helpful feedback.

### Landing

In order to land, a pull request needs to be reviewed and approved by at least
one maintainer. After that, if there are no objections from other contributors,
the pull request can be merged.

**Congratulations and thanks a lot for your contribution!**

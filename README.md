  - [Docker](#docker)
      - [Vocabulary](#vocabulary)
      - [Setup](#setup)
      - [Creating a docker container](#creating-a-docker-container)
          - [Dockerfile](#dockerfile)
      - [Command-line](#command-line)

# Docker

*Shipping code to the server should not be hard*

Docker allows applications to be shipped to new computers, and
irrespective of the local environment the application will work. That
is, it isolates that application scripts from the environment running
them.

## Vocabulary

- **Docker Hub**: Repository of free public _images_ that can be downloaded and run.
- **Docker Volumes:** are the preferred way of storing data needed and created by containers.
- **Docker Image**: A single file with all the dependencies & config details required to a run a program
	  - **Docker Container**: An instance of an _image_ with its own set of hardware resources. Runs the program.
- **Docker Client**: Tool that receives commands and passes them on to the _Docker server_. 
- **Docker Server**: Tool that is responsible for creating images, running containers, etc
- **Kernal**: Governs access between programs running on a machine, and the resources available to this machine: hard drive, CPU, & memory 

### Misc Vocab

- **Alpine**: Used in image titles to indicate a filesystem with the _bare minimum_ for executing a given program.

## Setup

  - Visit the [install page](https://docs.docker.com/docker-for-mac/install/) and follow instructions
  - Access [Docker Hub](https://hub.docker.com/)

## Images

A Docker Image is a snapshot of a filesystem (e.g., installations of python, chrome), and a set of start-up commands (e.g., `RUN Chrome`). Base images should be selected `FROM ` in the `Dockerfile` based on the set of included default programs and the needs of the resulting container.

## Containers

An instance of a Docker Image that has specific access to the machine's resources, to run specific programs. It combines 2 (Linux) OS features:

- **Namespacing**: A feature of operating systems that allows segmentation of hard disk resources (or any other resource: network access, inter-process visibility & communication, users) that are dedicated to specific programs (or group of processes/programs).
- **Control Groups**: AKA `cgroups` - Limits the _amount_ of computational resources alloted to a process or group of processes/programs.

Combining these 2 features allows _containers_ to limit the amount of resources it's processes can talk to, and the bandwidth on those resources.

Note that Docker Containers _share_ the kernel with the rest of the processes on the machine using the rest of the resources.

### Images


### Creating Containers

1.  Create a Dockerfile at the application root
2.  Create a Docker Image (using the Docker Client)
3.  Build container w/ Docker Image and Docker Client

### Dockerfile

A file stored at the application root directory. It is essentially a list of shell-like commands to run, and exit upon completion. It begins with configurations (e.g., `pip install ...`) then commands (e.g., `RUN python ...`)

The `Dockerfile` has the following flow:

1. Specify a `FROM` base image 
2. `RUN` some commands to install additional programs
3. Specify a `CMD` to run on container startup

#### Dockerfile Shell Commands

- `COPY <root_path> <docker_path>`: Copy `root_path` from the directory where the Docker file is location, to `docker_path` within the Docker environment. Often need to project make files available inside the container.
  - `--from=<tag>` allows `COPY`ing from another container phase in the `Dockerfile` (see tagging in `FROM`)
- `CMD`: Default command that is run if not overwritten in the `run/start` command. **Note**: this command is _not_ run at time of image creation, but rather at time of container `start`.
- `ENV <name> <value>`: Set environment variable `name` to `value`.
    Use for permanent values in the Docker environment.
- `EXPOSE` <port_num>: Used by web services to open ports. Otherwise, inactive but could be used as a note to devs for which port to expose in the `run` command. 
- `FROM <container-name>` - define container type as pre-built `container-name`, searchable on DockerHub or locally built image. Docker will check for images already downloaded first, then download if the image is missing. The `FROM` source may be tagged with `AS` command
- `MAINTAINER` <who>: `who` is responsible for this application
- `RUN <cmd>`: Execute `cmd`  within the `FROM` environment. **Note**: Docker will create a temporary container (out of the `FROM` image) to execute these commands as their own `CMD`s. Then shut that container down and deletes it.
- `WORKDIR <dir>`: Change the working directory to `dir` so that any following commands will operate on that directory instead of the root of the `FROM` image. That is best practice, as some `COPY` commands may move files with the same name as default files in the image root. If `dir` does not exist by default, Docker will create it.
- `#`: Comments! A `\` may be used on the line before and 

Docker will `cache` images in between `FROM`/`RUN`/`CMD` steps, and will load that image from cash on `docker build ...` commands in the future for _any_ `Dockerfile` flows in the _same_ order.

## Command-line

Simply executing `docker` will bring up abbreviated help. `docker <CMD> --help` brings up specific docker help.

### Image Commands

- `docker build <path>`: Build the application found at `path` with enclosed `Dockerfile`. 
  - The `-t <docker_id>/<project/repo_name>:<version_num>` option tags the resulting image for convenient use. For example, `docker build -t kdonavin/ostk_proj:latest`
  - The `-f` specifies the location/name of the `Dockerfile`. Useful for testing a dev `Dockerfile.dev`
- `docker commit [-c <CMD>] <container_id>`: Manually create an image from a container that any has any number of modifications. `-c` option overrides the default command with a new `CMD`.
- `docker images`: Show a table of downloaded images

### Container Commands

- `docker run [-aitp] <image> <cmd>` - (very important cmd) make and start a container from an image. If the image is not in the local cache, it will be sought in the Docker hub, or other specified repository. Equivalent to running `docker create` + `docker start`.  Override default startup commends with `cmd`. E.g., `docker run busybox ls`.
	- `-a` tells docker to _attach_ any output from the container to the terminal window. **Note**: The default command for the pre-existing container _cannot_ be replaced here.
 	- `-e`: Set environmental variable in docker env.
	- `-i`  triggers interactive mode, and 
	- `-t` attaches the terminal inside the container to the current terminal.
	- `-p [XXXX:YYYY]`: Route incoming requests on port `XXXX` to this `YYYY` port inside the container.
	- `-v`: Volumes option. Creates alias links from the container to files outside in the host machine. E.g., `-v $(pwd):/app` maps all files in the current working directory as volumes attached to `/app`. **Note:** if any other files are previously installed in the `/app` main directory, they will be overwritten with the volume command. If a directory should be preserved, the user can "bookmark" it with `-v /app/dir_to_bookmark` without a colon.
- `docker cp <file> container_name:/path/to/somewhere` - copy `file`  to `container_name` in a given path
- `docker create`: Create a docker container
- `docker exec [-it] <containerID> <cmd>`: Execute `cmd` within a running container. `-i` allows interactive mode, and `-t` attaches the current terminal to the VM's terminal. Without the attached terminal, the `STDIN`/`STDOUT` will still be sent forth and back but without the features of a terminal interface (e.g., auto-complete). To access a generic terminal shell, use `sh/bash/zsh` for the command.
- `docker logs <id>` - Return logs of container (including browser link and token). If a Docker container is `start` ed without the `-a` append flag, `logs` can be used to retrieve the output.
- `docker ps [-a]` - Show running containers. The `-a`/`--all` additionally shows any containers ever run on the machine
- `docker rm <name | id>` - Removes a container
- `docker start [-a] <name | id>` - Start a pre-existing container (preferable to run, which creates a new container first). 
- `docker stop/kill <name | id>` - Stop container `name`/`id`.  `stop` uses the  command `SIGTERM` (terminate signal) command, allowing container process cleanup (i.e., similar to `CTRL-C`). Stop automatically transitions to `kill` after 10 seconds, which rather sends the `SIGKILL` process command.

### Other Commands

- `docker system prune` - clean out stopped containers, "dangling" images, "dangling" build caches, and unused networks. Note that this will require redownload of images from Docker Hub if they are needed again. Good practice to run this command whenever the user is finished with a task requiring docker Docker as containers and images take up disk space.

## Docker Compose

A separate CLI to streamline multi-container infrastructure. The tool uses special syntax corresponding to Docker CLI commands recorded in a file call `docker-compose.yml`

### Elements

- `services:` type of container(s) needed. **Note**: _any_ image specified in the `services` are linked on the same network and are free to talk to each other.
```yaml
services:
  nameOfService:
    ...<options>
```
  - `build`: specify the `context:` project file location and `dockerfile:` location, or simply allow `docker-compose` to impute this from `.`
- `restart:` Specify what to do on exit of processes running in the specific `service`. There are 4 options:
  - `"no"`: default, do not restart. Note the quotes in this case _only_ to avoid YAML interpreting `no` as a false boolean.
  - `always`: always restart on exit
  - `on-failure`: only restart if the container stops with an error code (e.g., non-zero exit code)
  - `unless-stopped`: always restart unless we (the devs) forecibly stop (e.g., `CTRL-C`)
- `volumes:`
Examples where `restarts` are important to consider are a web-server (`always` restart) vs. a process application (`on-failure` to avoid repeating the process over and over)
- `command:` Commands to run upon `up`-ing this service. Written in an array, e.g., `["npm", "run", "test"]`.
- `environment:` A list of env variables to make available _at run time_ (not available to the image on its own).
```yml
...
environment:
  - REDIS_HOST=redis
  - REDIS_PORT=6379
  - ...
```
Note that `environment:` variables that are not set (i.e., no `=`) will attempt to be copied from the parent environment (if it exists).

### Commands

- `up [--build -d]`: Create and start containers. If no compose YAML is specified, Docker compose uses `docker-compose.yml` in the current directory. Adding `--build` also (re)builds the containers specified in the compose YAML.The `d` option stands for "detached" and runs the compose services without outputing to the master terminal or entering interactive mode.
- `down`: Stop and remove containers. If none are specified, this command acts on `services` found in the `docker-compose.yml`.

## Helper Tools for Docker Prod

- **Travis CI**: testing tool to be run on a master branch of a code-base before it is integrated (automatically) with the dockerhost.

### GitHub Actions

A Continuous Integration/Continuous Deployment workflow tool built into GitHub. GitHub Actions uses YAML files to define workflows, which are automated processes that run one or more jobs. These jobs are sets of steps that execute on the same runner, which is a virtual machine. GitHub Actions revolves around 4 main concepts: 

1. _triggers_ (when to run)
2. _jobs_ (what to do)
3. _steps_ (how to do it)
4. _actions_ (reusable units of code)

#### Folder Structure

```
project-root/
├── .github/
│   └── workflows/
│       └── main.yml
└── (rest of your project files)
```

The `.github/workflows` directory in your repository root is where you place your workflow files.

### AWS

- The Elastic Beanstalk application is great for app development because it _automatically_ scales up VMs runnng Dockers with our container inside as request load increases.

### NginX

_NGINX is a versatile software platform used as a web server, reverse proxy, load balancer, and more._ Particularly useful in multi-container Docker apps as a reverse proxy and a gateway between clients and backend server containers.



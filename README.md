<<<<<<< README.md
# PSF interface service

- [PSF interface service](#psf-interface-service)
  - [Description](#description)
  - [Manual for deploying and configuring the application](#manual-for-deploying-and-configuring-the-application)
    - [Installation](#installation)
    - [Depolyment guide](#depolyment-guide)
      - [Development deployment](#development-deployment)
      - [Production deployment (now it' not available)](#production-deployment-now-it-not-available)
    - [Engine(API) update manual](#engineapi-update-manual)
  - [Project structure](#project-structure)
  - [Useful materials](#useful-materials)

## Description

`About`: User-friendly interface for interacting with the backend of PSF applications (for processing medical images).

`Idea`: To make a website containing steppers as a way to interact with the client side with the server side. Also make it possible to authorize users.

`Technologies`: ReactJS, Django, Docker, Redis, Nginx, Celery, Flower

## Manual for deploying and configuring the application

### Installation

```bash
git clone https://github.com/IMZolin/frt23-3d-interface.git <your project name>
cd <your project name>
./bin/install.sh
sudo chmod +777 ./logs/redis.log # or manually add log file(redis.log) for redis
#for Windows
.venv/Scripts/Activate.ps1
#for Linux and Macos
source .venv/bin/activate 
```

Instead of `<your project name>`, insert the name of the directory where the project will be stored.

`Important`: If you have Windows, you need to change the console to Git Bash to run the command: `./bin/install.sh`

### Depolyment guide

For more detailed instructions on using Docker, refer to the [Docker Manual].

#### Development deployment

```bash
#build and run containers
docker-compose up -d --build
#stop containers
docker-compose stop
```

```bash
#build and run containers with separate commands
docker-compose build
docker-compose up -d
#stop containers
docker-compose stop
```

#### Production deployment (now it' not available)

```bash
cd backend
./install_prod.sh 
#or 
./install.sh 
cd ..
docker-compose.prod build
docker-compose.prod up -d
docker-compose.prod stop
```

### Engine(API) update manual

url of engine: <https://github.com/gerasimenkoab/simple_psf_extractor>

```bash
cd backend
cd engine
cd engine_lib
# make some changes
git add .
git commit -m"Some updates to engine..."
git push origin develop
cd ..
cd ..
cd ..
```

## Project structure

```bash
├───backend
│   ├───api
│   │   ├───migrations # db migrations
│   │   ├───admin.py # admin settins
│   │   ├───apps.py # apps config
│   │   ├───models.py # db models
│   │   ├───tasks.py # celery async tasks
│   │   ├───tests.py # tests for requests
│   │   ├───utils.py # support functions
│   │   └───views.py # request bodies
│   ├───backend
│   │   ├───asgi.py # prod executable file
│   │   ├───celery.py # main celery config
│   │   ├───middleware.py # apps config
│   │   ├───settings.py # server settings
│   │   ├───urls.py # endpoints
│   │   └───wsgi.py # local executable file
│   ├───engine
│   │   ├───engine_lib # PSF's API (other git repository)
│   │   └───README.md # doc
├───frontend 
│   ├───node_modules # libs
│   ├───public # assets and configs
│   └───src # code
│       ├───app # App.js with Routs and store(axios) - connect with the server
│       ├───components  # separate indep. parts of pages
│       ├───dev # to view and work on the components
│       ├───hooks  # support functions 
│       ├───pages # parts of app(e.x.: main page)
│       └───index.js # get results
├───gunicorn # gunicorn config
├───logs # logging
├───nginx # nginx config
└───systemd # gunicorn config
```

## Useful materials

1. Notion report(ru): <https://www.notion.so/1d4cb5d37f1743babc89a2bea9fbc829?pvs=4>
2. Board in Miro(ru): <https://miro.com/app/board/uXjVMFFZCSg=/?share_link_id=999021127197>
3. Postman: <https://red-meteor-969100.postman.co/workspace/e7cf7956-c97a-4a54-b834-a2929af5ccdd>

[Docker Manual]: <./Docker_manual.md>

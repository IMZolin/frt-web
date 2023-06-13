# PSF interface service

- [PSF interface service](#psf-interface-service)
  - [Description](#description)
  - [Get started](#get-started)
    - [Development](#development)
      - [Local settings](#local-settings)
      - [Docker](#docker)
    - [Production](#production)
      - [Local settings](#local-settings-1)
      - [Docker](#docker-1)
  - [Project structure](#project-structure)
  - [Useful materials](#useful-materials)

## Description

`About`: User-friendly interface for interacting with the backend of PSF applications (for processing medical images).

`Idea`: To make a website containing steppers as a way to interact with the client side with the server side. Also make it possible to authorize users.

`Technologies`: ReactJS, Django, Docker, Redis, Nginx

## Get started

```bash
git clone https://github.com/IMZolin/frt23-3d-interface.git <your project name>
cd <your project name>

# Frontend set up
cd frontend
npm install 
npm install --force # (if prev step doesn't work) 
npm start
cd ..
```

### Development

#### Local settings

```bash
cd backend
./install.sh
```

#### Docker

```bash
docker-compose build
docker-compose up -d
docker-compose stop
```

### Production

#### Local settings

```bash
cd backend
./install_prod.sh
```

#### Docker

```bash
docker-compose.prod build
docker-compose.prod up -d
docker-compose.prod stop
```

## Project structure

```bash
├───backend
│   ├───api # app: db migrations, models, views(requests)
│   ├───backend # settings, prod execut. file(wsgi), urls
│   ├───engine # image processing functions
│   ├───gunicorn.conf.py # interface (WSGI) HTTP server
│   └───manage.py # executable(dev) file
├───frontend 
│   ├───node_modules # libs
│   ├───public # assets and configs
│   └───src # code
│       ├───app # App.js with Routs and store(axios)
│       ├───components  # separate indep. parts of pages
│       ├───dev # to view and work on the components
│       ├───hooks  # support functions 
│       ├───pages # parts of app(e.x.: main page)
│       └───index.js # get results
├───nginx # nginx config
└───systemd # gunicorn config
```

## Useful materials

1. Notion report(ru): <https://www.notion.so/1d4cb5d37f1743babc89a2bea9fbc829?pvs=4>
2. Board in Miro(ru): <https://miro.com/app/board/uXjVMFFZCSg=/?share_link_id=999021127197>
3. Postman: <https://red-meteor-969100.postman.co/workspace/e7cf7956-c97a-4a54-b834-a2929af5ccdd>

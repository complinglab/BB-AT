# Behavioral Based Annotation Reliablity

A brief description of what this project does and who it's for

Technologies used:

- Node.js
- Express.js
- Python
- MongoDB
- React.js

## Demo

Insert gif or link to demo

## Getting Started

### Quickstart

Want to try the deployed version of this app? click here

### Prerequisites

Make sure you have these install on your system.

- Git
- Nodejs
- Jupyter-lab

### Installation & running locally

Clone the project

```bash
  git clone https://github.com/ashwinivd/Behaviour_based_ann_reliability
```

Create .env file and put environment variables (refer: .env.example)

```bash
MONGODB_CONNECT= mongo uri goes here... (local/atlas)
JWT_SECRET= JWT secret goes here...
```

Install and start the server

```bash
  npm install
  npm start
```

Install and start the client app

```bash
  cd react-ui
  npm install
  npm start
```

## Folder Structure

    ├── WorkPlan
    ├── analysis
    ├── datasets
    ├── papers
    ├── postprocessing
    ├── processJSONfrAnalysis
    ├── react-ui
    ├── server
        .env.example
        .gitignore
        Early_spec_notes_tool
        README.md
        itemdifficulty.csv
        package-lock.json
        package.json

The folders and files of our particular interest are,

- datasets
- postprocessing
- react-ui
- server
- .env.example
- package.json

## API Reference

### Auth

#### Signup

```
  POST /api/auth/signup
```

| Parameter  | Type     | Description            |
| :--------- | :------- | :--------------------- |
| `username` | `string` | **Required**. Username |
| `email`    | `string` | **Required**. Email    |
| `password` | `string` | **Required**. Password |

#### Signin

```
  POST /api/auth/signin
```

| Parameter  | Type     | Description            |
| :--------- | :------- | :--------------------- |
| `username` | `string` | **Required**. Username |
| `password` | `string` | **Required**. Password |

### Dashboard

<!-- create user -->

#### Create user

```
  POST /api/expt/createuser
```

| Parameter    | Type     | Description                                    |
| :----------- | :------- | :--------------------------------------------- |
| `username`   | `string` | **Required**. Username                         |
| `password`   | `string` | **Required**. Password                         |
| `role`       | `string` | **Required**. Role of user(default: annotator) |
| `experiment` | `string` | **Required**. id of experiment                 |

Experimentor creates user with a role that can be either of annotator or an adjudicator.

<!-- delete user -->

#### Delete user

```
  DELETE /api/expt/deleteuser
```

| Parameter      | Type     | Description                 |
| :------------- | :------- | :-------------------------- |
| `userId`       | `string` | **Required**. User Id       |
| `role`         | `string` | **Required**. Role of user  |
| `experimentId` | `string` | **Required**. Experiment Id |

<!-- get experiment -->

#### Get experiment

```
  GET /api/expt/experiment
```

<!-- update tags -->

#### Update tags

```
  PUT /api/expt/updatetags
```

| Parameter | Type     | Description                        |
| :-------- | :------- | :--------------------------------- |
| `id`      | `string` | **Required**. Experiment Id        |
| `tags`    | `array`  | **Required**. array of tag objects |

<!-- update parameters -->

#### Update parameters

```
  PUT /api/expt/updateparas
```

| Parameter      | Type     | Description                          |
| :------------- | :------- | :----------------------------------- |
| `experimentId` | `string` | **Required**. Experiment Id          |
| `values`       | `object` | **Required**. object with new values |

<!-- get tasks -->

#### Get tasks

```
  GET /api/expt/tasks?experimentId=experimentId
```

| Parameter      | Type     | Description                 |
| :------------- | :------- | :-------------------------- |
| `experimentId` | `string` | **Required**. Experiment Id |

<!-- treebanks -->

### Treebanks

<!-- treebank check -->

#### Check treebank

```
  GET /api/anno/treebanks/check
```

<!-- get treebank  -->

#### Get treebank

```
  GET /api/anno/treebanks/get
```

<!-- set treebank -->

#### Set treebank

```
  GET /api/anno/treebanks/set
```

| Parameter  | Type      | Description                            |
| :--------- | :-------- | :------------------------------------- |
| `selected` | `boolean` | **Required**. treebank selected status |

<!-- treebank reset -->

#### Reset treebank

```
  PUT /api/anno/treebanks/reset
```

| Parameter | Type      | Description                          |
| :-------- | :-------- | :----------------------------------- |
| `status`  | `boolean` | **Required**. treebank finish status |

<!-- tools -->

### Tools

<!-- fetch tasks -->
<!-- save task -->
<!-- get tagset -->
<!-- get label ambiguity -->
<!-- get experiment data -->
<!-- get item difficulty -->

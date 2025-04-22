how to setup the code 


git clone https://github.com/abdulrabbbi/task-backend.git

cd task-backend.git

npm install

env = NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d


nodemon sever.js

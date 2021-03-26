FROM node:15.12

RUN mkdir -p /home/node/

WORKDIR /home/node

RUN apt-get update
RUN apt-get install -y nano
RUN npm cache clean --force
RUN npm install -g npm
RUN npm install nodemon -g --save
RUN npm install mongoose --save
RUN npm install express --save
RUN npm install express-handlebars --save
RUN npm install express-session --save
RUN npm install connect-flash --save
RUN npm install body-parser --save
RUN npm install bcryptjs --save
RUN npm install passport --save
RUN npm install passport-local --save

#COPY . /home/node/

RUN chmod 777 -R /home/node/

EXPOSE 8081

CMD ["npm", "start"]
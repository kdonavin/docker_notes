# Specify base image
FROM node:14-alpine
WORKDIR /usr/app
MAINTAINER Kirkwood Donavin

# Install dependencies

#Only file that could invalidate the npm cache below
COPY ./package.json ./ 
RUN npm install

#Changes to any file other than package.json will not require redownload npm
#The following will copy the rest of the files required for this app
COPY ./ ./ 

# Default command
CMD ["npm", "start"]
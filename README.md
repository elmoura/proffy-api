# proffy-api
Proffy API - Developed during the Rocketseat's Next Level Week #2

This project was developed using Node.js with Typescript, Knex.js and using SQLite 
(this is easily changeable using Knex.js, we could migrate to a PostgreSQL or MySQL with less effort).

#Endpoints:

> GET - /classes
  List available classes for the applied filters at the QueryString;
  
  The querystring filters are:
    *weekday*: 0 to 6 (Sunday to Saturday);
    *subject*: class ID;
    *time*: class time (format: HH:mm);
  

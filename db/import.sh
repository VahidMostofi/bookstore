#!/bin/bash
# Import from fixtures

mongoimport --db bookstoreDB --collection users --type json --file /users.json --jsonArray
mongoimport --db bookstoreDB --collection books --type json --file /books.json --jsonArray
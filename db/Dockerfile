FROM bitnami/mongodb

USER root
RUN curl https://raw.githubusercontent.com/VahidMostofi/bookstore/dev/data/books.json --output books.json && curl https://raw.githubusercontent.com/VahidMostofi/bookstore/dev/data/users.json --output users.json
COPY import.sh /docker-entrypoint-initdb.d/
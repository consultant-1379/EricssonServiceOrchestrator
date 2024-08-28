#FROM armdocker.rnd.ericsson.se/baseimages/rhel:7
FROM ubuntu:latest
RUN apt-get update -y
RUN apt-get install -y python-pip python-dev build-essential
COPY . /app
WORKDIR /app
RUN pwd
RUN pip install -r requirements.txt
WORKDIR /app/src/main/python
RUN mkdir -p eso/esodata/deployments/
RUN mkdir -p eso/esodata/deployments/logs
ENTRYPOINT ["python"]
CMD ["rest.py"]
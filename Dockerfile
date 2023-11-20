FROM python:3.10-slim-buster

WORKDIR /innopolis_final

COPY . /innopolis_final

RUN pip3 install -r /innopolis_final/requirements.txt

EXPOSE 8080

CMD ["python3", "app.py"]
#ENTRYPOINT ["top", "-b"]
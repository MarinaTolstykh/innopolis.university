import json
import pickle
from flask_socketio import SocketIO, emit
from typing import Callable
from flask import Flask
from flask import render_template
import sqlite3

import numpy as np

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app)
model = pickle.load(open("models/robust.bin", "rb"))
con = sqlite3.connect("main_base.db")
cur = con.cursor()
last_pred = {}


@app.route("/")
def main_page() -> Callable:
    """Главная страница, рендер шаблона"""
    return render_template("main.html")


@app.route("/reseach")
def jupyter_page() -> Callable:
    """Страница с jupyter-тетрадкой (просмотр)"""
    return render_template("reseach.html")


@socketio.on("predict")
def predict(data: str):
    """Получение задачи предсказания

    Args:
        data (str): сериализованный json с данными для предсказания

    Notes:
        По-хорошему, web-api должен дальше прокидывать запрос на вычислительные инференсы, но это жеж учебный пример 😐
    """

    input_vector = np.zeros(9 * 2)
    for idx, item in enumerate(json.loads(data["data"]).values()):
        try:
            input_vector[idx] = float(item)
        except:
            input_vector[idx] = 0
            input_vector[idx + 9] = 1

    result = model.predict_proba(input_vector.reshape((1, -1)))

    global last_pred
    last_pred = {"input": input_vector.tolist(), "pred": np.argmax(result[0])}
    emit("prediction_result", {"result": result[0].tolist()})


@socketio.on("get_train_sample")
def get_train_sample(data: str):
    """Запрос на образец из базы

    Args:
        data (str): пустая срока
    """

    res = cur.execute("SELECT * FROM train_data ORDER BY RANDOM() LIMIT 1;")
    res = res.fetchall()[0]

    emit(
        "from_train_base",
        {
            "ph": res[0],
            "Hardness": res[1],
            "Solids": res[2],
            "Chloramines": res[3],
            "Sulfate": res[4],
            "Conductivity": res[5],
            "Organic_carbon": res[6],
            "Trihalomethanes": res[7],
            "Turbidity": res[8],
        },
    )


@socketio.on("send_answer")
def write_to_base(data: str):
    """Запись в базу нового вектора

    Args:
        data (str): верно или не верно придет с фронта
    """
    if json.loads(data["data"]):
        pred = last_pred["pred"]
    else:
        pred = int(not bool(last_pred["pred"]))

    input_data = last_pred["input"][:9] + [pred] + last_pred["input"][9:]
    query = "INSERT INTO train_data VALUES (" + ", ".join(map(str, input_data)) + ") "
    cur.execute(query)
    con.commit()


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8080)

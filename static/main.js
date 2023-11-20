let baseUrl = window.location.href
if (baseUrl.slice(-1) !== "/"){ baseUrl += "/"}

let inputs = {}
let answer = {}

window.addEventListener('load', (e) => {
    document.getElementById("navBasicLink").setAttribute("href", `${baseUrl}`);
    document.getElementById("navReseachLink").setAttribute("href", `${baseUrl}reseach`);

    inputs.ph = document.getElementById('phInput');
    inputs.Hardness = document.getElementById('hardnessInput');
    inputs.Solids = document.getElementById('solidsInput');
    inputs.Chloramines = document.getElementById('chloraminesInput');
    inputs.Sulfate = document.getElementById('sulfateInput');
    inputs.Conductivity = document.getElementById('conductivityInput');
    inputs.Organic_carbon = document.getElementById('organicCarbonInput');
    inputs.Trihalomethanes = document.getElementById('trihalomethanesInput');
    inputs.Turbidity = document.getElementById('turbidityInput');

    answer.header = document.getElementById("result");
    answer.unlockButton = document.getElementById("unlockButton");
    answer.wrongButton = document.getElementById("wrongButton");
    answer.trueButton = document.getElementById("trueButton");

    for(const item of Object.values(answer)){
        item.style.display = 'none';
    }
})

let socket = io();

function predict(){
    data = {
        'ph': inputs.ph.value === '' ? '--' : inputs.ph.value,
        'Hardness': inputs.Hardness.value === '' ? '--' : inputs.Hardness.value,
        'Solids': inputs.Solids.value === '' ? '--' : inputs.Solids.value,
        'Chloramines': inputs.Chloramines.value === '' ? '--' : inputs.Chloramines.value,
        'Sulfate': inputs.Sulfate.value === '' ? '--' : inputs.Sulfate.value,
        'Conductivity': inputs.Conductivity.value === '' ? '--' : inputs.Conductivity.value,
        'Organic_carbon': inputs.Organic_carbon.value === '' ? '--' : inputs.Organic_carbon.value,
        'Trihalomethanes': inputs.Trihalomethanes.value === '' ? '--' : inputs.Trihalomethanes.value,
        'Turbidity': inputs.Turbidity.value === '' ? '--' : inputs.Turbidity.value
    }
    socket.emit('predict', {
        'data': JSON.stringify(data)
    });
    for(const item of Object.values(inputs)){
        item.setAttribute('disabled', 'true');
    }
}

/**
 * Отправка запроса на данные из обучающей базы
 */
function getTrainSample(){
    socket.emit('get_train_sample', {});
}

// Получение значений из базы
socket.on('from_train_base', function(data){
    for(const [key, value] of Object.entries(data)){
        inputs[key].value = value;
    }
});

// Получение результат
socket.on('prediction_result', function(data){
    console.log(data)
    let value = data.result[0] > data.result[1] ? "Вода питьевая" : "Воду пить нельзя",
        proba = data.result[0] > data.result[1] ? data.result[0] : data.result[1]
    answer.header.innerText = `Результат: ${value} (${(parseFloat(proba) * 100.).toFixed(0)}%)`
    for(const item of Object.values(answer)){
        item.style.display = 'block';
    }
});

/**
 * Разблокировка интерфейса
 */
function unlock(){
    for(const item of Object.values(inputs)){
        item.removeAttribute('disabled');
    }
    for(const item of Object.values(answer)){
        item.style.display = 'none';
    }
}

/**
 * Посылаем серверу ответ на предсказание
 * @param {boolean} correct верно ли предсказание
 */
function sendAnswer(correct){
    socket.emit('send_answer', {
        'data': JSON.stringify(correct)
    });
    unlock();
}
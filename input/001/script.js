const num1Input = document.getElementById('num1');
const num2Input = document.getElementById('num2');
const resultDiv = document.getElementById('result');

document.querySelector('.buttons').addEventListener('click', function(event) {
  const button = event.target.closest('button[data-op]');
  if (!button) return;
  calculate(button.dataset.op);
});

document.getElementById('clear').addEventListener('click', function() {
  num1Input.value = '';
  num2Input.value = '';
  resultDiv.textContent = 'Tulemus kuvatakse siin';
  resultDiv.className = 'result';
});

function calculate(operator) {
  const a = parseFloat(num1Input.value);
  const b = parseFloat(num2Input.value);

  if (isNaN(a) || isNaN(b)) {
    showError('Palun sisesta mõlemasse välja arv');
    return;
  }

  if (operator === '/' && b === 0) {
    showError('Nulliga jagamine pole lubatud');
    return;
  }

  const operations = {
    '+': a + b,
    '-': a - b,
    '*': a * b,
    '/': a / b,
  };

  const result = operations[operator];
  resultDiv.textContent = `${a} ${operator} ${b} = ${result}`;
  resultDiv.className = 'result success';
}

function showError(message) {
  resultDiv.textContent = message;
  resultDiv.className = 'result error';
}

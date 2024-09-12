// Cargar diccionario para corrector ortográfico
let dictionary;

async function loadDictionary() {
    const response = await fetch('https://raw.githubusercontent.com/wooorm/dictionaries/main/dictionaries/es/index.dic');
    const aff = await response.text();
    dictionary = new Typo("es_ES", aff);
}

// Generar variaciones de una palabra (más agresivo)
function generateVariations(word) {
    // Convertir la palabra a minúsculas
    word = word.toLowerCase();
    const variations = [word];

    // Omisión de tildes (remover tildes en vocales)
    const accentMap = {
        'á': 'a',
        'é': 'e',
        'í': 'i',
        'ó': 'o',
        'ú': 'u'
    };
    let noAccents = word;
    for (const accented in accentMap) {
        noAccents = noAccents.replace(new RegExp(accented, 'g'), accentMap[accented]);
    }
    variations.push(noAccents);

    // Reglas más agresivas de variación

    // Sustituciones comunes de letras (errores de teclado o fonéticos)
    const letterSwaps = {
        'b': 'v',
        'v': 'b',
        'z': 's',
        's': 'z',
        'h': '',
        'll': 'y',
        'y': 'll',
        'c': 's',
        'k': 'q',
        'q': 'k',
        'g': 'j',
        'j': 'g',
        'u': 'o',
        'o': 'u',
        'm': 'n',
        'n': 'm'
    };

    // Aplicar cambios para intercambiar letras
    for (const [key, value] of Object.entries(letterSwaps)) {
        variations.push(word.replace(new RegExp(key, 'g'), value));
    }

    // Errores de teclado comunes (basados en proximidad)
    const keyboardSwaps = {
        'a': 'q',
        'q': 'a',
        'e': 'r',
        'r': 'e',
        'i': 'o',
        'o': 'i',
        'm': 'n',
        'n': 'm'
    };

    for (const [key, value] of Object.entries(keyboardSwaps)) {
        variations.push(word.replace(new RegExp(key, 'g'), value));
    }

    // Duplicación de letras (una repetición aleatoria de una letra)
    if (word.length > 2) {
        const randomIndex = Math.floor(Math.random() * (word.length - 1));
        const duplicateLetter = word[randomIndex] + word[randomIndex];
        variations.push(word.slice(0, randomIndex) + duplicateLetter + word.slice(randomIndex + 1));
    }

    // Añadir 's' al final o quitar última letra
    variations.push(word + 's');      // Añadir 's' al final
    variations.push(word.slice(0, -1)); // Quitar última letra

    // Variaciones de vocales intercambiadas
    const vowelSwaps = {
        'a': 'e',
        'e': 'a',
        'i': 'o',
        'o': 'i',
        'u': 'o',
        'o': 'u'
    };

    for (const [key, value] of Object.entries(vowelSwaps)) {
        variations.push(word.replace(new RegExp(key, 'g'), value));
    }

    // Sustitución de última letra si es consonante
    if (/[bcdfghjklmnpqrstvwxyz]$/.test(word)) {
        variations.push(word.slice(0, -1) + 's');
        variations.push(word.slice(0, -1) + 'n');
    }

    return variations.filter((variation, index) => variations.indexOf(variation) === index); // Eliminar duplicados
}

// Función para procesar el archivo cargado
function processFileContent(content) {
    const words = content.split(/\r?\n/);
    const variationList = document.getElementById('variationList');
    variationList.innerHTML = '';

    const variations = [];

    words.forEach(word => {
        if (word.trim()) {
            // Generar variaciones
            const wordVariations = generateVariations(word.trim());
            wordVariations.forEach(variation => {
                const li = document.createElement('li');
                li.textContent = variation;
                variationList.appendChild(li);
            });

            // Agregar variaciones a la lista final
            variations.push({ word: word.trim(), variations: wordVariations.join(', ') });
        }
    });

    // Mostrar botón de descarga
    document.getElementById('downloadBtn').style.display = 'block';

    // Habilitar descarga de CSV
    document.getElementById('downloadBtn').addEventListener('click', function () {
        downloadCSV(variations);
    });
}

// Función para descargar el archivo CSV
function downloadCSV(data) {
    const csvRows = [];
    csvRows.push('Palabra,Variaciones');

    data.forEach(row => {
        csvRows.push(`${row.word},"${row.variations}"`);
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'variaciones_palabras.csv';
    link.click();
}

// Procesar el archivo cargado
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        const extension = file.name.split('.').pop().toLowerCase();

        if (extension === 'txt' || extension === 'csv') {
            reader.onload = function(e) {
                processFileContent(e.target.result);
            };
            reader.readAsText(file);
        } else if (extension === 'xlsx') {
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const content = XLSX.utils.sheet_to_csv(firstSheet);
                processFileContent(content);
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Formato de archivo no soportado. Solo .txt, .csv o .xlsx');
        }
    }
});

// Procesar la lista de palabras
document.getElementById('processBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        alert('Por favor, selecciona un archivo de palabras.');
    }
});

// Cargar el corrector ortográfico
loadDictionary();
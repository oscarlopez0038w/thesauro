function generateTypoVariations(word) {
    const variations = new Set();

    // Añadir errores de teclas adyacentes (basado en el teclado QWERTY)
    const adjacentKeys = {
        'a': 'qsx',
        'b': 'vhn',
        'c': 'xv',
        'd': 'serfcx',
        'e': 'wsd',
        'f': 'rtdgv',
        'g': 'tyfhvb',
        'h': 'yujnb',
        'i': 'ujko',
        'j': 'uikmn',
        'k': 'ijlo',
        'l': 'opk',
        'm': 'njk',
        'n': 'bmh',
        'o': 'iklp',
        'p': 'ol',
        'q': 'was',
        'r': 'tfde',
        's': 'qwedxza',
        't': 'rgyf',
        'u': 'yhj',
        'v': 'cfgb',
        'w': 'qase',
        'x': 'zsc',
        'y': 'tghu',
        'z': 'asx'
    };

    // Añadir variaciones por errores comunes en teclado
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (adjacentKeys[char]) {
            adjacentKeys[char].split('').forEach(replacement => {
                variations.add(word.slice(0, i) + replacement + word.slice(i + 1));
            });
        }
    }

    // Añadir errores por duplicación de letras
    for (let i = 0; i < word.length; i++) {
        variations.add(word.slice(0, i) + word[i] + word.slice(i));
    }

    // Añadir errores por omisión de letras
    for (let i = 0; i < word.length; i++) {
        variations.add(word.slice(0, i) + word.slice(i + 1));
    }

    // Variaciones por sustitución de caracteres comunes (ej.: "0" por "o", "1" por "i")
    const replacements = {
        '0': 'o',
        '1': 'i',
        'l': '1',
        'o': '0'
    };
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (replacements[char]) {
            variations.add(word.slice(0, i) + replacements[char] + word.slice(i + 1));
        }
    }

    return Array.from(variations);
}

// Función para manejar el clic del botón
document.getElementById('generateBtn').addEventListener('click', function() {
    const word = document.getElementById('wordInput').value.trim();
    
    // Limpiar la lista anterior
    const list = document.getElementById('variationList');
    list.innerHTML = '';

    // Verificar que el input no esté vacío
    if (word === '') {
        const li = document.createElement('li');
        li.textContent = 'Por favor, introduce una palabra.';
        list.appendChild(li);
        return;
    }

    // Obtener y mostrar las variaciones
    const variations = generateTypoVariations(word);
    if (variations.length > 0) {
        variations.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            list.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No se encontraron variaciones.';
        list.appendChild(li);
    }
});
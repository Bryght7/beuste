var names = {
    0: 'zéro',
    1: 'un',
    2: 'deux',
    3: 'trois',
    4: 'quatre',
    5: 'cinq',
    6: 'six',
    7: 'sept',
    8: 'huit',
    9: 'neuf',
    10: 'dix',
    11: 'onze',
    12: 'douze',
    13: 'treize',
    14: 'quartoze',
    15: 'quinze',
    16: 'seize',
    20: 'vingt',
    30: 'trente',
    40: 'quarante',
    50: 'cinquante',
    60: 'soixante',
    100: 'cent',
};
var separators = {
    2: 'mille',
    3: 'million',
    4: 'milliard',
    5: 'billion',
    6: 'billiard',
    7: 'trillion',
    8: 'trilliard'
};
function reverse(s) {
    return s.split('').reverse().join('');
}
function separateThousands(input) {
    // Examples with input = '6486021351',
    var parts = reverse(input) // '1531206846'
        .match(/\d{1,3}/g) // ['153', '120', '684', '6']
        .reverse(); // ['6', '684', '120', '153']
    return parts.map(function (p) { return parseInt(reverse(p), 10); }); // [6, 486, 21, 351]
}
function between(min, n, max) {
    return n >= min && n <= max;
}
function getNumberName(num) {
    var hundreds = Math.floor(num / 100 % 10);
    var tens = Math.floor(num / 10 % 10);
    if (!between(0, num, 999)) {
        throw Error('This function expects a `num` value between 0 and 999.');
    }
    if (names.hasOwnProperty(num)) {
        return names[num];
    }
    if (num > 100) {
        if (hundreds > 1) {
            return num % 100 === 0 ?
                names[hundreds] + ' ' + names[100] + 's'
                : names[hundreds] + ' ' + names[100] + ' ' + getNumberName(num - hundreds * 100);
        }
        return names[100] + ' ' + getNumberName(num - hundreds * 100);
    }
    if (between(17, num, 19)) {
        return names[10] + '-' + names[num - 10];
    }
    if (num % 10 === 1 && between(21, num, 61)) { // 21, 31, ..., 61
        return names[tens * 10] + ' et ' + names[1];
    }
    if (between(22, num, 69)) {
        return names[tens * 10] + '-' + names[num - tens * 10];
    }
    if (between(70, num, 79)) {
        return num === 71 ?
            names[60] + ' et ' + names[11]
            : names[60] + '-' + getNumberName(num - 60);
    }
    if (between(80, num, 89)) {
        return num === 80 ?
            names[4] + '-' + names[20] + 's'
            : names[4] + '-' + names[20] + '-' + names[num - 80];
    }
    if (between(90, num, 99)) {
        return names[4] + '-' + names[20] + '-' + getNumberName(num - 80);
    }
}
function getSeparatorName(index, arr) {
    // if index = 0, arr = [15,214,453]
    var indexDesc = arr.length - index; // indexDesc = 3 => separator = 'million'
    var num = arr[index];
    if (separators.hasOwnProperty(indexDesc)) { // if known separator
        // if number > 1 and separator not 'mille' (invariable), then add -s
        return (num > 1 && separators[indexDesc] !== 'mille') ? separators[indexDesc] + 's' : separators[indexDesc];
    }
    return ''; // else no separator
}
function onClick() {
    var input = document.getElementById('test').value;
    console.log(separateThousands(input));
    separateThousands(input).forEach(function (num, index, arr) {
        var separatorName = getSeparatorName(index, arr);
        // if number ends with '80' OR number is 200,300,...,900
        // followed by "mille", then no plural -s in 'quatre-vingt' nor 'cent'
        if ((num.toString().slice(-2) === '80' || (num >= 200 && num % 100 === 0)) && separatorName === 'mille') {
            console.log(getNumberName(num).slice(0, -1)); // remove the -s
            console.log(separatorName);
            return;
        }
        // if [1, 0]
        if (num === 1 && separatorName === 'mille') {
            console.log(separatorName); // only print 'mille' instead of 'un mille'
            return;
        }
        // if 0 in a number with > 1 part, like in [125, 0, 0]
        if (num === 0 && arr.length > 1) {
            return; // ignore it
        }
        // default behavior
        console.log(getNumberName(num));
        console.log(separatorName);
    });
}
//# sourceMappingURL=script.js.map
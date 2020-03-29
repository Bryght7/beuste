new Vue({
  el: "#app",
  data: {
    input: "",
    results: {
      traditional: {
        label: "Traditionnelle",
        value: "",
        showCopySuccess: false,
      },
      monetary: {
        label: "Monétaire",
        value: "",
        showCopySuccess: false,
      },
    },
    isDarkMode: false,
  },
  created: function () {
    this.isDarkMode = localStorage.getItem("isDarkMode") === "true";
  },
  methods: {
    switchMode: function (event) {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem("isDarkMode", this.isDarkMode);
    },
    copyToClipboard: function (resultKey) {
      const copyHelper = document.createElement("input");
      copyHelper.className = "copyhelper";
      document.body.appendChild(copyHelper);
      copyHelper.value = this.results[resultKey].value;
      copyHelper.select();
      document.execCommand("copy");
      document.body.removeChild(copyHelper);
      this.results[resultKey].showCopySuccess = true;
      setTimeout(() => {
        this.results[resultKey].showCopySuccess = false;
      }, 1500);
    },
    onInput: function (event) {
      if (!this.input) {
        return;
      }
      this.results.traditional.value = getTraditionalSpelling(this.input);
      this.results.monetary.value = getMonetarySpelling(this.input);
    },
  },
});

const names = {
  0: "zéro",
  1: "un",
  2: "deux",
  3: "trois",
  4: "quatre",
  5: "cinq",
  6: "six",
  7: "sept",
  8: "huit",
  9: "neuf",
  10: "dix",
  11: "onze",
  12: "douze",
  13: "treize",
  14: "quartoze",
  15: "quinze",
  16: "seize",
  20: "vingt",
  30: "trente",
  40: "quarante",
  50: "cinquante",
  60: "soixante",
  100: "cent",
};

const separators = {
  2: "mille",
  3: "million",
  4: "milliard",
  5: "billion",
  6: "billiard",
  7: "trillion",
  8: "trilliard",
};

/**
 * @param {number} input A whole number
 * @returns {string} Input number converted to text
 */
function convertToText(input) {
  const resultArray = [];
  if (input.toString().indexOf(".") !== -1) {
    // if not a whole number
    throw Error("This function expects `input` to be a whole number.");
  }
  separateThousands(input.toString()).forEach((num, index, arr) => {
    const separatorName = getSeparatorName(index, arr);
    // if number ends with '80' OR number is 200,300,...,900
    // followed by "mille", then no plural -s in 'quatre-vingt' nor 'cent'
    if (
      (num.toString().slice(-2) === "80" || (num >= 200 && num % 100 === 0)) &&
      separatorName === "mille"
    ) {
      resultArray.push(getNumberName(num).slice(0, -1)); // remove the -s
      resultArray.push(separatorName);
      return;
    }
    // if [1, 0]
    if (num === 1 && separatorName === "mille") {
      resultArray.push(separatorName); // only print 'mille' instead of 'un mille'
      return;
    }
    // if 0 in a number with > 1 part, like in [125, 0, 0]
    if (num === 0 && arr.length > 1) {
      return; // ignore it
    }
    // default behavior
    resultArray.push(getNumberName(num));
    resultArray.push(separatorName);
  });
  return resultArray.filter((s) => s !== "").join(" ");
}

/**
 * @param {string} str
 * @returns {string}
 */
function reverse(str) {
  return str.split("").reverse().join("");
}

/**
 * Separate a whole number into an array of its thousands parts.
 *
 * _e.g_ `'6486021351'` will return `[6, 486, 21, 351]`
 *
 * @param {string} input String representation of a whole number
 * @returns {number[]} Array of thousands
 */
function separateThousands(input) {
  // Examples with input = '6486021351',
  const parts = reverse(input) // '1531206846'
    .match(/\d{1,3}/g) // ['153', '120', '684', '6']
    .reverse(); // ['6', '684', '120', '153']
  return parts.map((p) => parseInt(reverse(p), 10)); // [6, 486, 21, 351]
}

/**
 * @param {number} min
 * @param {number} n
 * @param {number} max
 * @returns {boolean}
 */
function between(min, n, max) {
  return n >= min && n <= max;
}

/**
 * Get the name of the specified whole number
 * @param {number} num A whole number between 0 and 999
 * @returns {string}
 */
function getNumberName(num) {
  const hundreds = Math.floor((num / 100) % 10);
  const tens = Math.floor((num / 10) % 10);

  if (!between(0, num, 999)) {
    throw Error("This function expects a `num` value between 0 and 999.");
  }
  if (names.hasOwnProperty(num)) {
    return names[num];
  }
  if (num > 100) {
    if (hundreds > 1) {
      return num % 100 === 0
        ? names[hundreds] + " " + names[100] + "s"
        : names[hundreds] +
            " " +
            names[100] +
            " " +
            getNumberName(num - hundreds * 100);
    }
    return names[100] + " " + getNumberName(num - hundreds * 100);
  }
  if (between(17, num, 19)) {
    return names[10] + "-" + names[num - 10];
  }
  if (num % 10 === 1 && between(21, num, 61)) {
    // 21, 31, ..., 61
    return names[tens * 10] + " et " + names[1];
  }
  if (between(22, num, 69)) {
    return names[tens * 10] + "-" + names[num - tens * 10];
  }
  if (between(70, num, 79)) {
    return num === 71
      ? names[60] + " et " + names[11]
      : names[60] + "-" + getNumberName(num - 60);
  }
  if (between(80, num, 89)) {
    return num === 80
      ? names[4] + "-" + names[20] + "s"
      : names[4] + "-" + names[20] + "-" + names[num - 80];
  }
  if (between(90, num, 99)) {
    return names[4] + "-" + names[20] + "-" + getNumberName(num - 80);
  }
}

/**
 * @param {number} index
 * @param {number[]} arr
 * @returns {string}
 */
function getSeparatorName(index, arr) {
  // if index = 0, arr = [15,214,453]
  const indexDesc = arr.length - index; // indexDesc = 3 => separator = 'million'
  const num = arr[index];

  if (separators.hasOwnProperty(indexDesc)) {
    // if known separator
    // if number > 1 and separator not 'mille' (invariable), then add -s
    return num > 1 && separators[indexDesc] !== "mille"
      ? separators[indexDesc] + "s"
      : separators[indexDesc];
  }
  return ""; // else no separator
}

/**
 * @param {number} input
 * @returns {string} Traditional spelling of the input number
 */
function getTraditionalSpelling(input) {
  const wholePartNumber = Math.floor(Math.abs(input)); // abs to ignore negative numbers
  const decimalPartNumber = parseInt(input.toString().split(".")[1]); // NaN if no decimal part

  const wholePart = convertToText(wholePartNumber);
  const decimalPart = isNaN(decimalPartNumber)
    ? undefined
    : convertToText(decimalPartNumber);

  return decimalPart ? wholePart + " virgule " + decimalPart : wholePart;
}

/**
 * @param {number} input
 * @returns {string} Monetary spelling of the input number
 */
function getMonetarySpelling(input) {
  let result = "";
  const wholePartNumber = Math.floor(Math.abs(input)); // abs to ignore negative numbers
  const decimalPartString = input.toString().split(".")[1]
    ? input.toString().split(".")[1].padEnd(2, "0").slice(0, 2)
    : undefined; // undefined if no decimal part
  const decimalPartNumber = parseInt(decimalPartString); // NaN if no decimal part

  const wholePart = convertToText(wholePartNumber);
  const decimalPart = isNaN(decimalPartNumber)
    ? undefined
    : convertToText(decimalPartNumber);

  result += wholePart + (wholePartNumber > 1 ? " euros" : " euro");
  return decimalPart
    ? result +
        " et " +
        decimalPart +
        (decimalPartNumber > 1 ? " centimes" : " centime")
    : result;
}

/**
 * String.prototype.padEnd() polyfill
 * https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
 */
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function padEnd(targetLength, padString) {
    targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
    padString = String(typeof padString !== "undefined" ? padString : " ");
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }
      return String(this) + padString.slice(0, targetLength);
    }
  };
}

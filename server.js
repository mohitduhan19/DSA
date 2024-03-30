const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
let storedNumbers = [];

app.use(express.json());

const fetchNumbers = async () => {
    try {
        const response = await axios.get("http://test-server-api/numbers");
        return response.data;
    } catch (error) {
        console.error("Error fetching numbers:", error);
        return [];
    }
};

const filterNumbers = (numbers, numberId) => {
    if (numberId === 'p') {
        return numbers.filter(isPrime);
    } else if (numberId === 'f') {
        return numbers.filter(isFibonacci);
    } else if (numberId === 'e') {
        return numbers.filter(num => num % 2 === 0);
    } else if (numberId === 'r') {
        return numbers;
    } else {
        return [];
    }
};

const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const isFibonacci = (num) => {
    return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4);
};

const isPerfectSquare = (num) => {
    const sqrt = Math.sqrt(num);
    return sqrt * sqrt === num;
};

const calculateAverage = (numbers) => {
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    return (sum / numbers.length).toFixed(2);
};

const updateStoredNumbers = (newNumbers) => {
    storedNumbers = storedNumbers.concat(newNumbers);
    storedNumbers = [...new Set(storedNumbers)]; // Remove duplicates
    if (storedNumbers.length > WINDOW_SIZE) {
        storedNumbers = storedNumbers.slice(storedNumbers.length - WINDOW_SIZE);
    }
};

app.get('/numbers/:numberId', async (req, res) => {
    const { numberId } = req.params;
    const numbers = await fetchNumbers();
    const filteredNumbers = filterNumbers(numbers, numberId);
    updateStoredNumbers(filteredNumbers);

    const windowPrevState = storedNumbers.slice(0, storedNumbers.length - filteredNumbers.length);
    const windowCurrState = storedNumbers.slice(-WINDOW_SIZE);

    const average = storedNumbers.length >= WINDOW_SIZE ? calculateAverage(windowCurrState) : null;

    res.json({
        windowPrevState,
        windowCurrState,
        numbers: windowCurrState,
        avg: average
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

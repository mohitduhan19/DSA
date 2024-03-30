const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
let storedNumbers = [];

app.use(express.json());

const fetchNumbers = async (accessToken) => {
    try {
        const response = await axios.get("http://20.244.56.144/test/numbers", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
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
    const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzExNzk3ODgyLCJpYXQiOjE3MTE3OTc1ODIsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjgxNDRjMmJjLTQ0OGQtNDQ3MC04NDIxLTgzZTViODk3ZTYzYiIsInN1YiI6InNoaXZhbS4yM01DQTEwMTczQHZpdGJob3BhbC5hYy5pbiJ9LCJjb21wYW55TmFtZSI6ImdvTWFydCIsImNsaWVudElEIjoiODE0NGMyYmMtNDQ4ZC00NDcwLTg0MjEtODNlNWI4OTdlNjNiIiwiY2xpZW50U2VjcmV0IjoiY1V3UWNOZkZGYVdvdHNWUCIsIm93bmVyTmFtZSI6IlNoaXZhbSIsIm93bmVyRW1haWwiOiJzaGl2YW0uMjNNQ0ExMDE3M0B2aXRiaG9wYWwuYWMuaW4iLCJyb2xsTm8iOiIyM01DQTEwMTczIn0.XTkwT7Oowswu7TSibYYheEabubEY5eUtg_PzmV1xRo0"; // Replace with your access token
    const numbers = await fetchNumbers(accessToken);
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
const sendUserQuestion = async (userInput) => {
    try {
        const response = await fetch('http://127.0.0.1:5000/write', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userInput }),
        });
       return response.json();
    } catch (error) {
        console.error('Error:', error);
    }
};

export default {
    sendUserQuestion

}
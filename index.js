const express = require('express');
const axios = require('axios');

const app = express();

// Configuração para lidar com proxy, se necessário
app.set('trust proxy', true);

app.get('/check-country', async (req, res) => {
    try {
        // Pega o IP real do cliente
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Consulta a API de geolocalização
        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country`);
        
        if (response.data.status !== 'success') {
            return res.status(500).json({ error: 'Não foi possível identificar o país' });
        }

        const country = response.data.country;
        const result = country === 'Cabo Verde';

        res.json({
            result,
            country,
            ip
        });
    } catch (err) {
        console.error('Erro ao identificar país:', err.message);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

export default app;

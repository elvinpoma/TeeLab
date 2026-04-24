const BASE_URL = 'http://localhost:3000';

const apiService = {
    async getCamisetas(queryParams = '') {
        try {
            const response = await fetch(`${BASE_URL}/camisetas${queryParams}`);
            if (!response.ok) throw new Error('Error al obtener el catálogo');
            return await response.json();
        } catch (error) { console.error("Error en getCamisetas:", error); return []; }
    },
    async getCamisetaById(id) {
        try {
            const response = await fetch(`${BASE_URL}/camisetas/${id}`);
            if (!response.ok) throw new Error('Camiseta no encontrada');
            return await response.json();
        } catch (error) { console.error("Error en getCamisetaById:", error); return null; }
    },
    async getComandas() {
        try {
            const response = await fetch(`${BASE_URL}/comandas`);
            if (!response.ok) throw new Error('Error al obtener las comandas');
            return await response.json();
        } catch (error) { console.error("Error en getComandas:", error); return []; }
    },
    async getComandaById(id) {
        try {
            const response = await fetch(`${BASE_URL}/comandas/${id}`);
            if (!response.ok) throw new Error('Ticket no encontrado');
            return await response.json();
        } catch (error) { console.error("Error en getComandaById:", error); return null; }
    },
    async postComanda(datosComanda) {
        try {
            const response = await fetch(`${BASE_URL}/comandas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosComanda)
            });
            if (!response.ok) throw new Error('No se pudo procesar la comanda');
            return await response.json();
        } catch (error) { console.error("Error en postComanda:", error); throw error; }
    }
};

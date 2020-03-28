const connection = require('../database/connection');
const generateUniqueId = require('../utils/generateUniqueId');

module.exports = {
    async index(request, response) {
        const ongs = await connection('ongs').select('*');
    
        return response.json(ongs);
    },
    
    async create(request, response) {
        const { name, email, whatsapp, city, uf } = request.body;
    
        const key = generateUniqueId();
        
        await connection('ongs').insert({
            key,
            name,
            email,
            whatsapp,
            city,
            uf
        });

        return response.json({ key });
    },

    async show(request, response) {

        const ong_key = request.headers.authorization;
        
        const ong = await connection('ongs')
            .select([
                'name',
                'email',
                'whatsapp',
                'city',
                'uf',
            ])
            .where('key', ong_key)
            .first();

        if (!ong) {
            return response.status(401).json({
                error: 'Not authorized.'
            });
        }

        return response.json(ong);
    },

    async update(request, response) {
        
        const { name, email, whatsapp, city, uf } = request.body;
        
        const ong_key = request.headers.authorization;
        
        const ong = await connection('ongs')
            .select('id')
            .where('key', ong_key)
            .first();

        if (!ong) {
            return response.status(401).json({
                error: 'Not authorized.'
            });
        }

        
        try {
            await connection('ongs')
                .where('key', ong_key)
                .update({
                    name,
                    email,
                    whatsapp,
                    city,
                    uf
                });
        } catch (error) {
            return response.status(400).json({
                error: 'Error while UPDATING.',
                message: error,
            });
        }

        const ongUpdated = await connection('ongs')
            .select('name')
            .where('key', ong_key)
            .first();

        return response.json(ongUpdated.name);
    },

    async delete(request, response) {
        
        const ong_key = request.headers.authorization;
        
        const ong = await connection('ongs')
        .where('key', ong_key)
        .first();

        if (!ong) {
            return response.status(401).json({
                error: 'Not authorized.'
            });
        }

        try {
            await connection('ongs')
                .where('id', ong.id)
                .delete();
        } catch (error) {
            return response.status(400).json({
                error: 'Error while DELETING.',
                message: error,
            });
        }

        return response.status(204).send();
    }
}
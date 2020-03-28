const connection = require('../database/connection');

module.exports = {
    async index(request, response) {
        const { page = 1 } = request.query;
        
        const [count] = await connection('incidents')
            .count();

        const incidents = await connection('incidents')
            .join('ongs', 'ongs.id', '=', 'incidents.ongs_id')
            .select([
                'incidents.*',
                'ongs.name',
                'ongs.email',
                'ongs.whatsapp',
                'ongs.city',
                'ongs.uf',
                'ongs.key'
            ])
            .limit(5)
            .offset((page - 1) * 5);
    
        response.header('X-Total-Count', count['count(*)']);

        return response.json(incidents);
    },

    async create(request, response) {
        const { title, description, value } = request.body;
        const ongs_key = request.headers.authorization;
        
        const ong = await connection('ongs')
            .select('id')
            .where('key', ongs_key)
            .first();

        if (!ong) {
            return response.status(401).json({
                error: 'Not authorized.'
            });
        }

        const ongs_id = await connection('ongs')
            .select('id')
            .where('key', ongs_key)
            .first();

        const [id] = await connection('incidents')
            .insert({
                title,
                description,
                value,
                ongs_id: ongs_id.id
            });

        return response.json({ id });
    },

    async show(request, response) {
        const { id } = request.params;
        const ongs_key = request.headers.authorization;
        const ongs_id = await connection('ongs')
            .select('id')
            .where('key', ongs_key)
            .first();

        if (!ongs_id) {
            return response.status(401).json({
                error: 'Not authorized.'
            });
        }

        const incident = await connection('incidents')
            .where('id', id)
            .select('*')
            .first();

        return response.json(incident);
    },

    async update(request, response) {
        const { id } = request.params;
        const { title, description, value } = request.body;
        const ongs_key = request.headers.authorization;
        
        const ong = await connection('ongs')
            .select('id')
            .where('key', ongs_key)
            .first();

        if (!ong) {
            return response.status(401).json({
                error: 'Not authorized.'
            });
        }

        const ongs_id = await connection('ongs')
            .select('id')
            .where('key', ongs_key)
            .first();

        const ongUpdated = await connection('incidents')
            .where('ongs_id', ongs_id.id)
            .where('id', id)
            .update({
                title,
                description,
                value,
                ongs_id: ongs_id.id
            });

        return response.json(ongUpdated);
    },

    async delete(request, response) {
        const { id } = request.params;
        const ongs_key = request.headers.authorization;
        const ongs_id = await connection('ongs')
            .select('id')
            .where('key', ongs_key)
            .first();

        if (!ongs_id) {
            return response.status(401).json({
                error: 'Not authorized.'
            });
        }

        const incident = await connection('incidents')
            .where('id', id)
            .select('ongs_id')
            .first();

        if (incident.ongs_id !== ongs_id.id) {
            return response.status(401).json({
                error: 'Operation not permitted.'
            })
        }

        await connection('incidents')
            .where('id', id)
            .delete();

        return response.status(204).send();
    },
}
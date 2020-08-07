import { Request, Response, response } from 'express';
import db from '../database/connection';

class ConnectionsController {

    async index(req: Request, res: Response) {

        try {

            const totalConnections = await db('connections').count('* as total');

            const [total] = totalConnections;

            return res.json(total);

        } catch (error) {

            return res.status(500).json({ error: error.stack || error });

        }

    }

    async create(req: Request, res: Response) {

        try {

            const { user_id } = req.body;

            await db('connections').insert({ user_id });

            return res.status(201).json({ success: true });

        } catch (error) {

            return res.status(500).json({ error: error.stack || error });

        }


    }

}

export default ConnectionsController;
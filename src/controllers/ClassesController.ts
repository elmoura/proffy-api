import { Request, Response } from 'express';

import convertHoursToMinutes from '../utils/convertHoursToMinutes';
import db from '../database/connection';

interface ScheduleItem {
    weekday: number,
    from: string,
    to: string
};

export default class ClassController {


    async index(req: Request, res: Response) {

        try {

            const filters = req.query;

            const subject = filters.subject as string;
            const time = filters.time as string;
            const weekday = filters.weekday as string;
    
            if (!subject || !weekday || !time) {
    
                return res.status(400).json({
                    error: 'Missing filters to search classes'
                });
    
            }
    
            const timeInMinutes = convertHoursToMinutes(time);

            const classes = await db('classes')
                .whereExists(function () {
    
                    this.select('classes_schedule.*')
                        .from('classes_schedule')
                        .whereRaw('`classes_schedule`.`class_id` = `classes`.`id`')
                        .whereRaw('`classes_schedule`.`week_day` = ??', [Number(weekday)])

                        .whereRaw('`classes_schedule`.`from` <= ??', [timeInMinutes])
                        .whereRaw('`classes_schedule`.`to` > ??', [timeInMinutes]);

                })
                .where('classes.subject', '=', subject)
                .join('users', 'classes.user_id', '=', 'users.id')
                .select(['classes.*', 'users.*']);
    
            return res.json({ classes });

        } catch (error) {

            return res.status(500).json({ error: error.stack || error });

        }

    }

    async create(req: Request, res: Response) {

        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = req.body;

        const transaction = await db.transaction();

        try {

            const insertedUserIds = await transaction('users').insert({ name, avatar, whatsapp, bio, });

            const [user_id] = insertedUserIds;

            const insertedClassesIds = await transaction('classes').insert({
                user_id,
                subject,
                cost
            });

            const [class_id] = insertedClassesIds;

            const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {

                return {
                    week_day: scheduleItem.weekday,
                    from: convertHoursToMinutes(scheduleItem.from),
                    to: convertHoursToMinutes(scheduleItem.to),
                    class_id
                };

            });

            await transaction('classes_schedule').insert(classSchedule);

            await transaction.commit();

            res.status(201).json({ success: true });

        } catch (error) {

            console.log(error.stack || error);

            await transaction.rollback();

            res.status(500).json({
                success: false,
                message: 'Unexpected error while creating new class',
                error: error.stack
            });

        }

    }

}
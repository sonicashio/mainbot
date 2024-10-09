import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User, UserLevel } from "~/server/entities/user";
import type { LeaderBoardUserDto } from "~/types/dto";

const querySchema = z.object({
    level: z.coerce.number().min(1),
});

const cachedUserRank = defineCachedFunction(
    async (userId: number, em: EntityManager) => {
        const userRank: { rank: string } = await em.getConnection("read").execute(
            `
                SELECT * FROM
                (
                    SELECT 
                        id,
                        DENSE_RANK() OVER (ORDER BY profit_per_hour DESC) AS rank,
                        profit_per_hour
                    FROM (
                        SELECT 
                            id,
                            profit_per_hour
                        FROM 
                            users
                        ORDER BY id ASC
                    ) as user_profits
                ) as ranked_users
                WHERE id = ?;
            `,
            [userId],
            "get",
        );

        // const userRankxx: { rank: number } = await em.createQueryBuilder(User, "u")
        //     .select([
        //         raw(`RANK() OVER (ORDER BY profit_per_hour DESC) AS rank`),
        //     ])
        //     .where({ level, profitPerHour: { $gt: user.profitPerHour } })
        //     .cache([`user_${user.id}_rankxx`, 600_000])
        //     .execute();
        // console.log("userRankxx", userRankxx);

        // const userRank: { rank: string }[] = await em.createQueryBuilder(User)
        //     .select([
        //         raw("count(*) + 1 AS rank"),
        //     ])
        //     .where({ level, profitPerHour: { $gt: user.profitPerHour } })
        //     .cache([`user_${user.id}_rank`, 600_000])
        //     .execute();

        return parseInt(userRank.rank);
    },
    {
        maxAge: 10 * 60,
        name: "user_profit_per_hour_rank",
        getKey: (userId: number) => `user_${userId}_rank`,
    },
);

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const query: unknown = getQuery(event);
    const queryResult = querySchema.safeParse(query);
    if (!queryResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid query parameters",
            data: queryResult.error,
        });
    }

    const em: EntityManager = useEntityManager<EntityManager>(event);

    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Current user not found",
        });
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    const level: UserLevel | null = await em.findOne(
        UserLevel,
        { level: queryResult.data.level },
        { cache: [`user_level_${queryResult.data.level}`, 600_000] },
    );
    if (level === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Level not found",
        });
    }

    const maxLevel: UserLevel[] = await em.find(
        UserLevel,
        {},
        { orderBy: { level: "DESC" }, limit: 1, cache: [`user_level_max`, 600_000] },
    );

    const topUsers: User[] = await em.find(
        User,
        { level, profitPerHour: { $gt: 0 } },
        {
            orderBy: { profitPerHour: "DESC" },
            limit: 100,
            cache: [`leaderboard_users_${level.level}`, 600_000],
        },
    );

    let userDataDto: LeaderBoardUserDto | undefined = undefined;
    if (user.level.level === level.level) {
        const userRank: number = await cachedUserRank(user.id, em);

        userDataDto = {
            telegramId: user.telegramId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
            profitPerHour: user.profitPerHour,
            level: user.level.level,
            rank: userRank,
        };
    }

    let uRank: number = 0;
    let lastTopUserProfit: number = 0;
    const topUsersDto: LeaderBoardUserDto[] = topUsers.map((user) => {
        if (lastTopUserProfit !== user.profitPerHour || uRank === 0) {
            uRank++;
            lastTopUserProfit = user.profitPerHour;
        }

        return {
            telegramId: user.telegramId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            photoUrl: user.photoUrl,
            profitPerHour: user.profitPerHour,
            level: user.level.level,
            rank: uRank,
        };
    });

    return {
        topUsers: topUsersDto,
        user: userDataDto,
        maxLevel: maxLevel[0].level,
    };
});

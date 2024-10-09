import type { EntityManager } from "@mikro-orm/postgresql";
import { z } from "zod";
import { User } from "~/server/entities/user";
import { UserRole } from "~/types";
import { UserDto } from "~/types/dto/user";

const SortableFields = ["id", "level", "balance", "profit", "referrals", "created_at"] as const;
const OrderDirection = ["ASC", "DESC"] as const;

const querySchema = z.object({
    search: z.string().min(0, "Search string must not be empty"),
    offset: z.coerce.number().min(0, "Offset must be 0 or greater"),
    limit: z.coerce.number().min(1, "Limit must be 1 or greater"),
    role: z.union([z.string().length(0), z.nativeEnum(UserRole)]).optional(),
    orderBy: z.enum(SortableFields).optional().default("id"),
    orderDirection: z.enum(OrderDirection).optional().default("ASC"),
});

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = querySchema.safeParse(getQuery(event));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const body = bodyResult.data;
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

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is not an admin",
        });
    }

    const qb = em.createQueryBuilder(User, "u");

    // Add search conditions
    if (body.search !== undefined) {
        const searchNumber = Number(body.search);
        const isNumberSearch = !isNaN(searchNumber);

        qb.where({
            $or: [
                { username: { $ilike: `%${body.search}%` } },
                { firstName: { $ilike: `%${body.search}%` } },
                { lastName: { $ilike: `%${body.search}%` } },
                ...(isNumberSearch ? [{ telegramId: searchNumber }] : []),
            ],
        });
    }

    // Add role filter
    if (body.role !== undefined && body.role !== "") {
        qb.andWhere({ role: body.role as UserRole });
    }

    // Add pagination
    qb.offset(body.offset)
        .limit(body.limit);

    // Add sorting based on the field
    switch (body.orderBy) {
        case "referrals":
            // qb.leftJoin("u.referrals", "r")
            //     .groupBy("u.id")
            //     .select("*");

            // // Add raw SQL for counting referrals and sorting
            // qb.getKnexQuery().select(em.getKnex().raw("COUNT(r.id) as referrals_count"))
            //     .orderBy("referrals_count", body.orderDirection);

            qb.orderBy({ referralsCount: body.orderDirection });
            break;
        case "profit":
            qb.orderBy({ profitPerHour: body.orderDirection });
            break;
        case "created_at":
            qb.orderBy({ createdAt: "ASC" });
            break;
        case "id":
            qb.orderBy({ id: "ASC" });
            break;
        default:
            qb.orderBy({ [body.orderBy]: body.orderDirection });
    }

    const [users, total] = await qb.getResultAndCount();

    const userDtos = await Promise.all(
        users.map(userToDto => UserDto.fromUser(em, userToDto, null)),
    );

    return {
        users: userDtos,
        total,
        offset: body.offset,
        limit: body.limit,
        orderBy: body.orderBy,
        orderDirection: body.orderDirection,
    };
});

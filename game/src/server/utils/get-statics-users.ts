import { EntityManager, raw } from "@mikro-orm/postgresql";
import { UsersStatics } from "~/server/entities/statics";
import { User } from "~/server/entities/user";

export async function getStaticsUsers(em: EntityManager): Promise<Omit<UsersStatics, "id">> {
    // Total Users
    const totalUsers: number = await em.count(User);

    // Total Clicks
    const totalClicks: number = +(await em.createQueryBuilder(User)
        .select(raw("SUM(total_clicks) as total"))
        .execute<{ total: string }>("get")).total;

    // Total Clicks Coins
    const totalClicksCoins: number = +(await em.createQueryBuilder(User)
        .select(raw("SUM(total_balance_get_from_clicks) as total"))
        .execute<{ total: string }>("get")).total;

    // Total Coins
    const totalCoins: number = +(await em.createQueryBuilder(User)
        .select(raw("SUM(balance) as total"))
        .execute<{ total: string }>("get")).total;

    // Average Clicks per User
    const avgClicksPerUser: number = totalUsers > 0 ? totalClicks / totalUsers : 0;

    // Average Coins per User
    const avgCoinsPerUser: number = totalUsers > 0 ? totalCoins / totalUsers : 0;

    // Most Active User
    const mostActiveUser = (await em.find(User, { }, { orderBy: { totalClicks: "DESC" }, limit: 1 }))[0];

    // New Users in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newUsers24h = await em.count(User, { createdAt: { $gte: oneDayAgo } });

    // Total Time Played (assuming lastClickSyncTime represents the last activity)
    // const totalTimePlayed: number = +(await em.createQueryBuilder(User)
    //     .select(raw("SUM(last_click_sync_time - EXTRACT(EPOCH FROM created_at) * 1000) as total"))
    //     .execute<{ total: string }>("get")).total;

    // Total Referral Rewards
    const totalReferralRewards: number = +(await em.createQueryBuilder(User)
        .select(raw("SUM(total_referral_rewards) as total"))
        .execute<{ total: string }>("get")).total;

    // User Growth (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const userGrowth7Day = await em.createQueryBuilder(User)
        .select([
            raw("DATE(created_at) as date"),
            raw("COUNT(*) as count"),
        ])
        .where({ createdAt: { $gte: sevenDaysAgo } })
        .groupBy(raw("date"))
        .orderBy({ [raw("date")]: "ASC" })
        .execute<{ date: string; count: string }[]>("all");

    // Top Users by Coins
    const topUsers = await em.createQueryBuilder(User)
        .select(["telegramId", "balance"])
        .orderBy({ balance: "DESC" })
        .limit(10)
        .execute<{ telegramId: string; balance: number }[]>("all");

    // Users Count by Country (sorted by user count in descending order)
    const usersByCountry = await em.createQueryBuilder(User)
        .select([
            "country",
            raw("COUNT(*) as count"),
        ])
        .groupBy("country")
        .orderBy({ [raw("count")]: "DESC" })
        .execute<{ country: string; count: number }[]>("all");

    return {
        date: new Date(),
        totalUsers,
        totalClicks,
        totalClicksCoins,
        totalCoins,
        avgClicksPerUser,
        avgCoinsPerUser,
        mostActiveUser,
        newUsers24h,
        totalReferralRewards,
        userGrowth7Day,
        topUsers,
        usersByCountry,
    };
}

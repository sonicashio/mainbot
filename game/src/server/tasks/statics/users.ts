import { EntityManager } from "@mikro-orm/postgresql";
import { UsersStatics } from "~/server/entities/statics";

export default defineTask({
    meta: {
        name: "statics:users",
        description: "Run database migrations",
    },
    run: async () => {
        console.log(`[${new Date().toISOString()}] Running statics users task...`);
        const em = <EntityManager>useOrm().em.fork();

        await em.insert(UsersStatics, await getStaticsUsers(em));
        await em.flush();

        console.log(`[${new Date().toISOString()}] Finished statics users task`);
        return { result: "Success" };
    },
});

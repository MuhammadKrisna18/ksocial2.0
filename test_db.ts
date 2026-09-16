import { db } from './src/lib/infrastructure/database/client';
import { likes, posts } from './src/lib/infrastructure/database/schema';

async function main() {
    const allLikes = await db.select().from(likes);
    console.log('LIKES TABLE:', allLikes);
    const allPosts = await db.select().from(posts);
    console.log('POSTS TABLE (ID, LIKES_COUNT):', allPosts.map(p => ({ id: p.id, content: p.content, likesCount: p.likesCount })));
    process.exit(0);
}
main();

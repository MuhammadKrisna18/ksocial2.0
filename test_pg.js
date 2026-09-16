import postgres from 'postgres';
const sql = postgres('postgres://postgres:postgres@localhost:6543/ksocial2.0');

async function main() {
  const likes = await sql`SELECT * FROM likes`;
  console.log('LIKES:', likes);
  const posts = await sql`SELECT id, content, likes_count FROM posts`;
  console.log('POSTS:', posts);
  process.exit(0);
}
main();

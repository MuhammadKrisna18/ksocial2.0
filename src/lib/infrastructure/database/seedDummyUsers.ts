import 'dotenv/config';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from './schema/index';
import type { RoleNameType } from '$lib/domain/value-objects/RoleName';
import { BCRYPT_SALT_ROUNDS, DEFAULT_USER_ROLE } from '$lib/infrastructure/config/constants';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing DATABASE_URL');

const queryClient = postgres(DATABASE_URL);
const db = drizzle(queryClient, { schema });

// Domain penanda untuk akun dummy agar 100% aman dan mudah dihapus
export const DUMMY_EMAIL_DOMAIN = '@dummy.ksocial.test';

export interface DummyUserData {
	fullName: string;
	username: string;
	email: string;
	profilePictureUrl: string;
	bio: string;
	posts: {
		content: string;
		media?: { url: string; type: 'image' | 'video' }[];
		hoursAgo: number;
		likesCount?: number;
		commentsCount?: number;
	}[];
}

const DUMMY_USERS: DummyUserData[] = [
	{
		fullName: 'Andi Pratama',
		username: 'andi_pratama',
		email: `andi${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
		bio: 'Software engineer & tech enthusiast dari Jakarta.',
		posts: [
			{
				content: 'Halo teman-teman di K-Social! Baru pertama kali coba platform ini, tampilannya keren dan responsif banget 👍',
				hoursAgo: 2,
				likesCount: 5,
				commentsCount: 2
			}
		]
	},
	{
		fullName: 'Siti Rahma',
		username: 'siti_rahma',
		email: `siti${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
		bio: 'Pencinta alam, fotografi, dan kopi senja.',
		posts: [
			{
				content: 'Pemandangan pagi hari di pegunungan selalu bisa menenangkan pikiran sejenak dari hiruk pikuk kota.',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 4,
				likesCount: 12,
				commentsCount: 3
			},
			{
				content: 'Jangan lupa luangkan waktu 15 menit hari ini untuk sekadar bersyukur dan istirahat sejenak ☕✨',
				hoursAgo: 14,
				likesCount: 8,
				commentsCount: 1
			}
		]
	},
	{
		fullName: 'Budi Santoso',
		username: 'budi_santoso',
		email: `budi${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
		bio: 'Fullstack Developer | SvelteKit & Postgres Fanatic',
		posts: [
			{
				content: 'Setup meja kerja baru untuk minggu ini. Minimalis dan fokus!',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 6,
				likesCount: 19,
				commentsCount: 4
			},
			{
				content: 'Video cuplikan animasi pendek yang sangat inspiratif!',
				media: [
					{
						url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
						type: 'video'
					}
				],
				hoursAgo: 20,
				likesCount: 14,
				commentsCount: 5
			},
			{
				content: 'Tips Clean Architecture: pisahkan aturan bisnis murni (Domain) dari infrastruktur database. Sangat memudahkan saat unit testing.',
				hoursAgo: 36,
				likesCount: 22,
				commentsCount: 7
			}
		]
	},
	{
		fullName: 'Maya Lestari',
		username: 'maya_lestari',
		email: `maya${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
		bio: 'Food blogger & healthy lifestyle explorer.',
		posts: [
			{
				content: 'Makan siang sehat hari ini: fresh salad bowl dengan dressing wijen sangrai. Segar dan bertenaga! 🥗',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 7,
				likesCount: 15,
				commentsCount: 2
			}
		]
	},
	{
		fullName: 'Reza Aditya',
		username: 'reza_aditya',
		email: `reza${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
		bio: 'Videographer & cat lover.',
		posts: [
			{
				content: 'Kenalin si Oyen yang kerjaannya tidur seharian di atas keyboard 😹',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 3,
				likesCount: 31,
				commentsCount: 9
			},
			{
				content: 'Cuplikan video cinematic pemandangan dan api unggun.',
				media: [
					{
						url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
						type: 'video'
					}
				],
				hoursAgo: 16,
				likesCount: 11,
				commentsCount: 2
			},
			{
				content: 'Sedang mencoba color grading baru di DaVinci Resolve. Ada yang punya rekomendasi LUT natural?',
				hoursAgo: 28,
				likesCount: 6,
				commentsCount: 4
			},
			{
				content: 'Selamat berakhir pekan semuanya! Nikmati waktu bersama orang-orang tersayang.',
				hoursAgo: 50,
				likesCount: 9,
				commentsCount: 0
			}
		]
	},
	{
		fullName: 'Dewi Anggraini',
		username: 'dewi_anggraini',
		email: `dewi${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
		bio: 'UI/UX Designer | Seni & Estetika',
		posts: [
			{
				content: 'Desain yang baik bukan hanya tentang bagaimana tampilannya, tapi bagaimana cara kerjanya terasa natural bagi pengguna.',
				hoursAgo: 9,
				likesCount: 24,
				commentsCount: 5
			},
			{
				content: 'Video motion design untuk animasi loading interaktif.',
				media: [
					{
						url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
						type: 'video'
					}
				],
				hoursAgo: 30,
				likesCount: 17,
				commentsCount: 3
			}
		]
	},
	{
		fullName: 'Dimas Saputra',
		username: 'dimas_saputra',
		email: `dimas${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
		bio: 'Digital nomad & travel enthusiast.',
		posts: [
			{
				content: 'Menjelajahi pesisir pantai sore hari. Suasana hening dan suara deburan ombak bikin rileks.',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 5,
				likesCount: 18,
				commentsCount: 3
			},
			{
				content: 'Pameran karya seni kontemporer di galeri lokal.',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 22,
				likesCount: 13,
				commentsCount: 1
			},
			{
				content: 'Bekerja secara remote mengajarkan kita tentang manajemen waktu dan disiplin diri yang nyata.',
				hoursAgo: 45,
				likesCount: 16,
				commentsCount: 4
			}
		]
	},
	{
		fullName: 'Nina Kurnia',
		username: 'nina_kurnia',
		email: `nina${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
		bio: 'Videographer & storytelling enthusiast.',
		posts: [
			{
				content: 'Klip pendek video keindahan alam liar.',
				media: [
					{
						url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
						type: 'video'
					}
				],
				hoursAgo: 11,
				likesCount: 20,
				commentsCount: 6
			}
		]
	},
	{
		fullName: 'Fajar Hidayat',
		username: 'fajar_hidayat',
		email: `fajar${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
		bio: 'Dog trainer & animal advocate.',
		posts: [
			{
				content: 'Teman setia yang selalu menyambut di depan pintu rumah dengan penuh semangat 🐶❤️',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 8,
				likesCount: 27,
				commentsCount: 5
			},
			{
				content: 'Melatih anjing bukan soal kepatuhan buta, tapi soal membangun komunikasi dan rasa percaya dua arah.',
				hoursAgo: 32,
				likesCount: 10,
				commentsCount: 2
			}
		]
	},
	{
		fullName: 'Putri Amelia',
		username: 'putri_amelia',
		email: `putri${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
		bio: 'Product Manager | Tech Writer',
		posts: [
			{
				content: 'Diskusi tim produk hari ini sangat produktif membahas roadmap kuartal depan!',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 1,
				likesCount: 35,
				commentsCount: 8
			},
			{
				content: 'Klip presentasi produk baru.',
				media: [
					{
						url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
						type: 'video'
					}
				],
				hoursAgo: 12,
				likesCount: 16,
				commentsCount: 3
			},
			{
				content: 'Prioritaskan fitur yang benar-benar memecahkan masalah pengguna, bukan hanya fitur yang terlihat keren di atas kertas.',
				hoursAgo: 25,
				likesCount: 21,
				commentsCount: 6
			},
			{
				content: 'Buku bacaan minggu ini: Inspired oleh Marty Cagan. Sangat direkomendasikan untuk siapa pun yang membangun produk digital.',
				hoursAgo: 40,
				likesCount: 14,
				commentsCount: 2
			},
			{
				content: 'Selamat pagi dunia! Semangat untuk mencapai target mingguan kalian 🚀',
				hoursAgo: 60,
				likesCount: 9,
				commentsCount: 1
			}
		]
	},
	{
		fullName: 'Alex Turner',
		username: 'alex_turner',
		email: `alex${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
		bio: 'Musician & indie artist.',
		posts: [
			{
				content: 'Suasana konser semalam sungguh luar biasa! Energi dari penonton benar-benar membakar semangat.',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 15,
				likesCount: 42,
				commentsCount: 11
			},
			{
				content: 'Sedang menulis lagu baru dengan progresi akord minor. Musik adalah bahasa jiwa.',
				hoursAgo: 48,
				likesCount: 19,
				commentsCount: 4
			}
		]
	},
	{
		fullName: 'Clara Wijaya',
		username: 'clara_wijaya',
		email: `clara${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
		bio: 'Coffee connoisseur & cafe hopper.',
		posts: [
			{
				content: 'Menemukan kedai kopi tersembunyi dengan suasana super cozy di sudut kota.',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 10,
				likesCount: 25,
				commentsCount: 4
			},
			{
				content: 'V60 Ethiopian beans dengan rasa fruity dan aroma melati. Kopi terbaik hari ini!',
				hoursAgo: 35,
				likesCount: 18,
				commentsCount: 3
			},
			{
				content: 'Ada yang punya rekomendasi kafe ramah laptop di daerah Jakarta Selatan?',
				hoursAgo: 72,
				likesCount: 11,
				commentsCount: 7
			}
		]
	},
	{
		fullName: 'Gilang Ramadhan',
		username: 'gilang_ramadhan',
		email: `gilang${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
		bio: 'Cybersecurity Analyst & Open Source Contributor.',
		posts: [
			{
				content: 'Ingat untuk selalu mengaktifkan 2FA (Two-Factor Authentication) pada semua akun penting Anda. Keamanan digital dimulai dari kebiasaan kecil.',
				hoursAgo: 18,
				likesCount: 33,
				commentsCount: 5
			}
		]
	},
	{
		fullName: 'Hannah Baker',
		username: 'hannah_baker',
		email: `hannah${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80',
		bio: 'Student & aspiring data scientist.',
		posts: [
			{
				content: 'Video pembelajaran interaktif yang bagus tentang visualisasi data.',
				media: [
					{
						url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
						type: 'video'
					}
				],
				hoursAgo: 13,
				likesCount: 17,
				commentsCount: 3
			},
			{
				content: 'Akhirnya berhasil memahami cara kerja neural network dari dasar matematika matriks. Puas banget rasanya!',
				hoursAgo: 38,
				likesCount: 20,
				commentsCount: 4
			}
		]
	},
	{
		fullName: 'Indra Kusuma',
		username: 'indra_kusuma',
		email: `indra${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
		bio: 'Calisthenics & Fitness enthusiast.',
		posts: [
			{
				content: 'Konsistensi mengalahkan motivasi. Jangan tunggu mood datang untuk mulai berolahraga.',
				hoursAgo: 5,
				likesCount: 29,
				commentsCount: 4
			},
			{
				content: 'Video latihan fisik outdoor hari ini.',
				media: [
					{
						url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
						type: 'video'
					}
				],
				hoursAgo: 21,
				likesCount: 15,
				commentsCount: 2
			},
			{
				content: 'Target pull-up 20 reps tercapai tanpa jeda! Latihan keras tidak pernah mengkhianati hasil.',
				hoursAgo: 42,
				likesCount: 24,
				commentsCount: 6
			},
			{
				content: 'Menu pre-workout favorit: pisang + segelas americano tanpa gula. Praktis dan efektif.',
				hoursAgo: 65,
				likesCount: 12,
				commentsCount: 1
			}
		]
	},
	{
		fullName: 'Jessica Tan',
		username: 'jessica_tan',
		email: `jessica${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
		bio: 'Bibliophile & creative writer.',
		posts: [
			{
				content: 'Sudut baca favorit di rumah. Tidak ada yang lebih menyenangkan daripada aroma buku baru.',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 17,
				likesCount: 22,
				commentsCount: 3
			},
			{
				content: '"Satu-satunya batasan untuk meraih mimpi kita adalah keraguan kita hari ini." - Franklin D. Roosevelt',
				hoursAgo: 44,
				likesCount: 16,
				commentsCount: 1
			}
		]
	},
	{
		fullName: 'Kevin Sanford',
		username: 'kevin_sanford',
		email: `kevin${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
		bio: 'Automotive & landscape photographer.',
		posts: [
			{
				content: 'Langit sore yang memancarkan spektrum warna alami aurora dan lembah pegunungan.',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 23,
				likesCount: 38,
				commentsCount: 6
			}
		]
	},
	{
		fullName: 'Luna Safitri',
		username: 'luna_safitri',
		email: `luna${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
		bio: 'Mindfulness coach & meditation practitioner.',
		posts: [
			{
				content: 'Tarik napas dalam-dalam, hembuskan perlahan. Apapun beban hari ini, kamu sudah berusaha sebaik mungkin.',
				hoursAgo: 8,
				likesCount: 26,
				commentsCount: 5
			},
			{
				content: 'Ketenangan pemandangan danau saat fajar menyingsing.',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 29,
				likesCount: 30,
				commentsCount: 4
			},
			{
				content: 'Belajar untuk melepaskan hal-hal yang berada di luar kendali kita adalah kunci kedamaian sejati.',
				hoursAgo: 55,
				likesCount: 19,
				commentsCount: 2
			}
		]
	},
	{
		fullName: 'Michael Chen',
		username: 'michael_chen',
		email: `michael${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
		bio: 'Hardware engineer & IoT builder.',
		posts: [
			{
				content: 'Membangun prototype sensor cuaca mandiri dengan ESP32 dan solar panel mini.',
				media: [
					{
						url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
						type: 'image'
					}
				],
				hoursAgo: 19,
				likesCount: 28,
				commentsCount: 5
			},
			{
				content: 'Open source hardware berkembang sangat pesat belakangan ini. Era IoT semakin terjangkau bagi semua orang.',
				hoursAgo: 46,
				likesCount: 14,
				commentsCount: 2
			}
		]
	},
	{
		fullName: 'Nadia Utami',
		username: 'nadia_utami',
		email: `nadia${DUMMY_EMAIL_DOMAIN}`,
		profilePictureUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
		bio: 'Guru bahasa & penggiat literasi anak.',
		posts: [
			{
				content: 'Senang sekali melihat antusiasme anak-anak membaca buku cerita di perpustakaan keliling hari ini! Literasi adalah jendela masa depan 📚✨',
				hoursAgo: 10,
				likesCount: 34,
				commentsCount: 6
			}
		]
	}
];

async function seedDummyUsers(): Promise<void> {
	// Pastikan role default 'user' ada
	const roleRows = await db
		.select()
		.from(schema.roles)
		.where(eq(schema.roles.name, DEFAULT_USER_ROLE as RoleNameType))
		.limit(1);

	let userRoleId = '';
	if (roleRows.length > 0) {
		userRoleId = roleRows[0].id;
	} else {
		userRoleId = randomUUID();
		await db.insert(schema.roles).values({ id: userRoleId, name: DEFAULT_USER_ROLE as RoleNameType });
		console.log('Role default "user" dibuat.');
	}

	// Password hash seragam untuk semua dummy user (password: 'password123')
	const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

	console.log(`Memproses seeding ${DUMMY_USERS.length} akun dummy...`);
	let userCount = 0;
	let postCount = 0;

	for (const dummy of DUMMY_USERS) {
		// Periksa apakah user dummy sudah ada
		const existing = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, dummy.email))
			.limit(1);

		let userId = '';
		if (existing.length === 0) {
			userId = randomUUID();
			await db.insert(schema.users).values({
				id: userId,
				fullName: dummy.fullName,
				username: dummy.username,
				email: dummy.email,
				passwordHash,
				profilePictureUrl: dummy.profilePictureUrl,
				dateOfBirth: new Date('1998-01-01')
			});

			await db.insert(schema.userRoles).values({
				userId,
				roleId: userRoleId
			});

			userCount++;
			console.log(`+ Akun dibuat: ${dummy.fullName} (@${dummy.username}) [${dummy.email}]`);
		} else {
			userId = existing[0].id;
			console.log(`= Akun sudah ada: ${dummy.fullName} (@${dummy.username}), memperbarui postingan...`);
		}

		// Tambahkan postingan untuk user ini
		for (const postData of dummy.posts) {
			const postId = randomUUID();
			const postCreatedAt = new Date(Date.now() - postData.hoursAgo * 60 * 60 * 1000);

			await db.insert(schema.posts).values({
				id: postId,
				userId,
				content: postData.content,
				media: postData.media ?? null,
				likesCount: postData.likesCount ?? 0,
				commentsCount: postData.commentsCount ?? 0,
				sharesCount: 0,
				createdAt: postCreatedAt,
				updatedAt: postCreatedAt
			});

			postCount++;
		}
	}

	console.log(`\nBerhasil menambahkan ${userCount} akun dummy baru dan ${postCount} postingan bervariasi!`);
	console.log('Semua akun dummy memiliki password: "password123"');
	console.log('Akun dummy dapat dihapus kapan saja dengan perintah: npm run db:clean-dummy');
}

async function main(): Promise<void> {
	try {
		await seedDummyUsers();
	} catch (err) {
		console.error('Gagal melakukan seed dummy users:', err);
		process.exit(1);
	} finally {
		await queryClient.end();
	}
}

main();

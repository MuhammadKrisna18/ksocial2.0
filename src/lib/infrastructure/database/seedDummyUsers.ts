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

// Identifier domain for dummy accounts for 100% safe creation and cleanup
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
		bio: 'Software engineer & tech enthusiast from Jakarta.',
		posts: [
			{
				content: 'Hello friends on K-Social! First time trying out this platform, the interface looks awesome and super responsive 👍',
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
		bio: 'Nature lover, photography enthusiast, and sunset coffee fan.',
		posts: [
			{
				content: 'Morning views in the mountains always calm the mind away from the city hustle and bustle.',
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
				content: "Don't forget to take 15 minutes today just to be grateful and take a quick break ☕✨",
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
				content: 'New workspace setup for this week. Minimalist and focused!',
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
				content: 'An inspiring short animated film clip!',
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
				content: 'Clean Architecture tip: isolate pure business rules (Domain) from the database infrastructure. It makes unit testing so much easier.',
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
				content: 'Healthy lunch today: fresh salad bowl with roasted sesame dressing. Crisp and energizing! 🥗',
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
				content: 'Meet Ginger who spends the entire day sleeping on the keyboard 😹',
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
				content: 'Cinematic video clip of scenery and a campfire.',
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
				content: 'Testing out new color grading in DaVinci Resolve. Does anyone have natural LUT recommendations?',
				hoursAgo: 28,
				likesCount: 6,
				commentsCount: 4
			},
			{
				content: 'Have a wonderful weekend everyone! Enjoy quality time with loved ones.',
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
		bio: 'UI/UX Designer | Art & Aesthetics',
		posts: [
			{
				content: 'Good design is not just how it looks, but how naturally it feels and works for users.',
				hoursAgo: 9,
				likesCount: 24,
				commentsCount: 5
			},
			{
				content: 'Motion design video for interactive loading animations.',
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
				content: 'Exploring the coastline in the late afternoon. The calm ambiance and ocean waves are so relaxing.',
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
				content: 'Contemporary art exhibition at a local gallery.',
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
				content: 'Working remotely teaches us real time management and self-discipline.',
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
				content: 'Short clip highlighting the beauty of wildlife.',
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
				content: 'A loyal buddy who always greets me at the door with excitement 🐶❤️',
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
				content: 'Dog training is not about blind obedience; it is about building two-way communication and trust.',
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
				content: 'Great product team session today discussing the next quarterly roadmap!',
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
				content: 'New product presentation teaser clip.',
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
				content: 'Prioritize features that genuinely solve user pain points, not just features that look cool on paper.',
				hoursAgo: 25,
				likesCount: 21,
				commentsCount: 6
			},
			{
				content: 'Book recommendation of the week: Inspired by Marty Cagan. Highly recommended for anyone building digital products.',
				hoursAgo: 40,
				likesCount: 14,
				commentsCount: 2
			},
			{
				content: 'Good morning world! Wishing everyone energy to hit their weekly goals 🚀',
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
				content: 'The concert atmosphere last night was incredible! The energy from the crowd was truly electric.',
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
				content: 'Writing a new song with a minor chord progression. Music is the language of the soul.',
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
				content: 'Discovered a hidden coffee shop with a super cozy ambiance tucked away in the city corner.',
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
				content: 'V60 Ethiopian beans with fruity notes and jasmine aroma. Best coffee of the day!',
				hoursAgo: 35,
				likesCount: 18,
				commentsCount: 3
			},
			{
				content: 'Does anyone have recommendations for laptop-friendly cafes around South Jakarta?',
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
				content: 'Remember to always enable 2FA (Two-Factor Authentication) on all your critical accounts. Digital security starts with small daily habits.',
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
				content: 'A great interactive learning video on data visualization.',
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
				content: 'Finally grasped how neural networks work from fundamental matrix mathematics. So rewarding!',
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
				content: 'Consistency beats motivation. Never wait for the mood to hit before you start working out.',
				hoursAgo: 5,
				likesCount: 29,
				commentsCount: 4
			},
			{
				content: 'Outdoor workout clip from today.',
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
				content: 'Hit 20 consecutive pull-up reps unbroken! Hard work never betrays the results.',
				hoursAgo: 42,
				likesCount: 24,
				commentsCount: 6
			},
			{
				content: 'Favorite pre-workout: a banana + a cup of unsweetened americano. Simple and effective.',
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
				content: 'Favorite reading corner at home. Nothing beats the smell of new books.',
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
				content: '"The only limit to our realization of tomorrow will be our doubts of today." - Franklin D. Roosevelt',
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
				content: 'Evening sky radiating natural colors above the mountain valley.',
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
				content: 'Take a deep breath in, exhale slowly. Whatever today held, you did your very best.',
				hoursAgo: 8,
				likesCount: 26,
				commentsCount: 5
			},
			{
				content: 'Tranquil lake view as dawn breaks.',
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
				content: 'Learning to let go of things beyond our control is the key to true inner peace.',
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
				content: 'Building a standalone weather sensor prototype with ESP32 and mini solar panels.',
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
				content: 'Open-source hardware has grown tremendously lately. The IoT era is more accessible than ever.',
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
		bio: 'Language teacher & children literacy advocate.',
		posts: [
			{
				content: 'So heartwarming to see children enthusiastically reading storybooks at the mobile library today! Literacy is the window to the future 📚✨',
				hoursAgo: 10,
				likesCount: 34,
				commentsCount: 6
			}
		]
	}
];

async function seedDummyUsers(): Promise<void> {
	// Ensure default 'user' role exists
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
		console.log('Default "user" role created.');
	}

	// Uniform password hash for all dummy users (password: 'password123')
	const passwordHash = await bcrypt.hash('password123', BCRYPT_SALT_ROUNDS);

	console.log(`Processing seed for ${DUMMY_USERS.length} dummy accounts...`);
	let userCount = 0;
	let postCount = 0;

	for (const dummy of DUMMY_USERS) {
		// Check if dummy user already exists
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
			console.log(`+ Account created: ${dummy.fullName} (@${dummy.username}) [${dummy.email}]`);
		} else {
			userId = existing[0].id;
			console.log(`= Account already exists: ${dummy.fullName} (@${dummy.username}), updating posts...`);
		}

		// Add posts for this user
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

	console.log(`\nSuccessfully added ${userCount} new dummy accounts and ${postCount} varied posts!`);
	console.log('All dummy accounts have password: "password123"');
	console.log('Dummy accounts can be cleaned up anytime with command: npm run db:clean-dummy');
}

async function main(): Promise<void> {
	try {
		await seedDummyUsers();
	} catch (err) {
		console.error('Failed to seed dummy users:', err);
		process.exit(1);
	} finally {
		await queryClient.end();
	}
}

main();
